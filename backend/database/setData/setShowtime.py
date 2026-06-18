import pymysql
from datetime import datetime, timedelta, date, time
import random
import sys

# ------------------ CẤU HÌNH DATABASE ------------------
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "123456",  
    "database": "dcine_schema", 
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor
}

# ------------------ CẤU HÌNH LOGIC ------------------
START_HOUR = 8          
END_HOUR = 23           
CLEANUP_TIME = 15       

# 1. DANH SÁCH PHIM HOT (Thứ tự giảm dần độ ưu tiên)
# Code sẽ tìm các phim có tên chứa từ khóa dưới đây để tăng suất chiếu
HOT_MOVIE_KEYWORDS = [
    "Avatar 3", 
    "Avatar: Fire and Ash",
    "Phi Vụ Động Trời 2", "Zootopia 2",
    "Vua Của Các Vua", "The King of Kings",
    "Truy Tìm Long Diên Hương",
    "Hoàng Tử Quỷ",
    "Phi Vụ Thế Kỷ", "Now You See Me 3",
    "Quán Kỳ Nam"
]

# 2. CẤU HÌNH PHÒNG ĐẶC BIỆT (Kết hợp danh sách cũ và yêu cầu mới)
SPECIAL_MOVIES_CONFIG = {
    "IMAX": [
        "Avatar", "Avatar: Fire and Ash",
        "The Running Man", "G-DRAGON IN CINEMA", 
        "Predator: Badlands", "Gojira Mainasu Wan", "Zootopia 2",
        "Phim Điện Ảnh Thám Tử Lừng Danh Conan: Dư Ảnh Của Độc Nhãn",
        "Chainsaw Man - The Movie: Chương Reze"
    ],
    "4DX": [
        "Avatar", "Avatar: Fire and Ash",
        "The Running Man", "G-DRAGON IN CINEMA", 
        "Predator: Badlands", "Gojira Mainasu Wan", "Zootopia 2",
        "Phim Điện Ảnh Thám Tử Lừng Danh Conan: Dư Ảnh Của Độc Nhãn",
        "Chainsaw Man - The Movie: Chương Reze"
    ],
    "SUPER CLASS": [
        "Gojira Mainasu Wan", "Nak Rak Mak", "하얀 차를 탄 여자", 
        "Predator: Badlands", "Truy Tìm Long Diên Hương", 
        "The Running Man", "Haunted Mountain: The Yellow Taboo",
        "Vua Của Các Vua", "Quán Kỳ Nam"
    ],
    "BEDOM": [
        "Truy Tìm Long Diên Hương", "Will You Marry Monk?", 
        "Haunted Mountain: The Yellow Taboo", "Predator: Badlands", 
        "하얀 차를 탄 여자", "The Running Man",
        "Hoàng Tử Quỷ", "Phi Vụ Thế Kỷ"
    ]
}

# Giá vé cơ bản
PRICE_MAP = {
    "2D": 50000,
    "IMAX": 80000,
    "4DX": 80000,
    "BEDOM": 150000,
    "SUPER CLASS": 130000
}

def connect_db():
    try:
        return pymysql.connect(**DB_CONFIG)
    except pymysql.Error as e:
        print(f"Lỗi kết nối database: {e}")
        sys.exit(1)

def round_to_5_minutes(dt):
    minute = dt.minute
    remainder = minute % 5
    if remainder == 0: return dt
    return dt + timedelta(minutes=(5 - remainder))

def is_hot_movie(title, original_title):
    """Kiểm tra xem phim có nằm trong danh sách HOT không"""
    check_str = (str(title) + " " + str(original_title)).lower()
    for kw in HOT_MOVIE_KEYWORDS:
        if kw.lower() in check_str:
            return True
    return False

def generate_showtimes():
    conn = connect_db()
    cursor = conn.cursor()

    print("--- BẮT ĐẦU TẠO SUẤT CHIẾU (LOGIC PHỦ SÓNG + PHIM HOT THEO YÊU CẦU) ---")

    try:
        # 1. Xóa dữ liệu cũ
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
        cursor.execute("TRUNCATE TABLE showtime;")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
        print("Đã xóa sạch dữ liệu showtime cũ.")

        # 2. Lấy danh sách phim (Mở rộng đến hết năm)
        sql_movie = """
            SELECT movie_id, title, original_title, duration_min, release_date 
            FROM movie 
            WHERE release_date <= '2026-07-31' 
            ORDER BY release_date DESC
        """
        cursor.execute(sql_movie)
        all_movies = cursor.fetchall()

        if not all_movies:
            print("Không có phim nào trong CSDL.")
            return

        # Xác định ID các phim Hot từ DB dựa trên tên
        hot_movie_ids = []
        for m in all_movies:
            if is_hot_movie(m['title'], m['original_title']):
                hot_movie_ids.append(m['movie_id'])
        
        print(f"Đã nhận diện {len(hot_movie_ids)} phim Hot theo danh sách yêu cầu.")

        # 3. Lấy Hall & Room Type
        sql_hall = """
            SELECT h.hall_id, h.theater_id, h.name, rt.name AS room_type_name
            FROM hall h
            JOIN seat_layout sl ON h.seat_layout_id = sl.seat_layout_id
            JOIN room_type rt ON sl.room_type_id = rt.room_type_id
            ORDER BY h.theater_id
        """
        cursor.execute(sql_hall)
        all_halls = cursor.fetchall()

        theaters = {} 
        for hall in all_halls:
            tid = hall['theater_id']
            if tid not in theaters: theaters[tid] = []
            theaters[tid].append(hall)

        # 4. Loop Ngày (Từ hôm nay đến 31/07)
        today = date.today()
        end_date = date(2026, 7, 31)
        current_date = today
        total_inserted = 0

        while current_date <= end_date:
            is_weekend = current_date.weekday() >= 4
            day_label = "CUỐI TUẦN" if is_weekend else "THƯỜNG"
            print(f"-> Đang xếp lịch: {current_date} ({day_label})")
            
            # Phim đang hoạt động (Release date <= ngày hiện tại)
            active_movies = [m for m in all_movies if m['release_date'] <= current_date]

            for tid, halls in theaters.items():
                theater_used_times = set() # Tránh trùng giờ khởi chiếu trong rạp
                
                # Set theo dõi phim đã được xếp trong rạp hôm nay
                movies_scheduled_in_theater = set()

                for hall in halls:
                    hall_type = hall['room_type_name']
                    hall_id = hall['hall_id']
                    
                    # --- LỌC PHIM THEO LOẠI PHÒNG ---
                    candidate_movies = []
                    if hall_type == "2D":
                        candidate_movies = active_movies
                    else:
                        allowed_titles = SPECIAL_MOVIES_CONFIG.get(hall_type, [])
                        candidate_movies = [
                            m for m in active_movies 
                            if any(k.lower() in (str(m['original_title']) + str(m['title'])).lower() for k in allowed_titles)
                        ]
                    
                    if not candidate_movies: continue

                    # --- CẤU HÌNH SỐ LƯỢNG SUẤT (ĐA DẠNG) ---
                    # Random nhẹ số suất để mỗi ngày, mỗi rạp trông khác nhau
                    max_slots = 0
                    if hall_type == "2D":
                        base_slots = 8 if is_weekend else 6
                        max_slots = base_slots + random.randint(0, 2) # 6-8 hoặc 8-10 suất
                    else:
                        base_slots = 6 if is_weekend else 4
                        max_slots = base_slots + random.randint(0, 1)

                    # --- GIỜ BẮT ĐẦU NGẪU NHIÊN ---
                    start_hour = START_HOUR
                    start_minute = random.choice([0, 10, 15, 20, 30, 40, 45, 50])
                    current_slot = datetime.combine(current_date, time(start_hour, start_minute))
                    
                    slots_created = 0

                    while slots_created < max_slots:
                        limit_time = datetime.combine(current_date, time(END_HOUR, 59))
                        if current_slot > limit_time: break

                        selected_movie = None
                        
                        # === LOGIC CỐT LÕI ===
                        
                        # 1. ƯU TIÊN PHỦ SÓNG: 
                        # Tìm phim hợp lệ mà CHƯA được chiếu suất nào ở rạp này hôm nay
                        neglected = [m for m in candidate_movies if m['movie_id'] not in movies_scheduled_in_theater]
                        
                        # Nếu rạp còn nhiều slot trống, ưu tiên nhét phim ế vào
                        # Nếu chỉ còn ít slot, nhường cho phim Hot để tối ưu doanh thu
                        should_pick_neglected = False
                        if neglected:
                            # Nếu số slot còn lại nhiều hơn số phim ế -> Chắc chắn pick
                            if (max_slots - slots_created) >= len(neglected):
                                should_pick_neglected = True
                            else:
                                # Nếu không, tỷ lệ 70% cứu phim ế
                                should_pick_neglected = (random.random() < 0.7)

                        if should_pick_neglected and neglected:
                            selected_movie = random.choice(neglected)
                        else:
                            # 2. LOGIC PHIM HOT (WEIGHTED RANDOM)
                            # Tạo pool với trọng số dựa trên danh sách yêu cầu
                            weighted_pool = []
                            for m in candidate_movies:
                                if m['movie_id'] in hot_movie_ids:
                                    # Phim trong list Hot của bạn: Weight cực cao (25)
                                    weight = 25
                                elif (current_date - m['release_date']).days < 20:
                                    # Phim mới ra mắt khác: Weight trung bình (8)
                                    weight = 8
                                else:
                                    # Phim cũ: Weight thấp (2)
                                    weight = 2
                                weighted_pool.extend([m] * weight)
                            
                            selected_movie = random.choice(weighted_pool)

                        # Tính thời gian
                        duration = selected_movie['duration_min'] if selected_movie['duration_min'] else 110
                        
                        # Tránh trùng giờ bắt đầu quá sát
                        valid_start = False
                        temp_start = current_slot
                        for _ in range(6): 
                            t_str = temp_start.strftime("%H:%M")
                            if t_str not in theater_used_times:
                                valid_start = True
                                current_slot = temp_start
                                break
                            temp_start += timedelta(minutes=5)
                        
                        if not valid_start:
                            current_slot += timedelta(minutes=10)
                            continue

                        try:
                            price = PRICE_MAP.get(hall_type, 60000)
                            if is_weekend: price += 10000
                            
                            end_at = current_slot + timedelta(minutes=duration)

                            cursor.execute("""
                                INSERT INTO showtime (movie_id, hall_id, start_at, end_at, base_price)
                                VALUES (%s, %s, %s, %s, %s)
                            """, (selected_movie['movie_id'], hall_id, current_slot, end_at, price))
                            
                            total_inserted += 1
                            slots_created += 1
                            
                            movies_scheduled_in_theater.add(selected_movie['movie_id'])
                            theater_used_times.add(current_slot.strftime("%H:%M"))
                            
                            # Thời gian dọn dẹp cũng random nhẹ (10-15p) cho tự nhiên
                            real_cleanup = CLEANUP_TIME + random.choice([-5, 0, 5]) 
                            if real_cleanup < 10: real_cleanup = 10
                            
                            next_raw = end_at + timedelta(minutes=real_cleanup)
                            current_slot = round_to_5_minutes(next_raw)

                        except Exception as e:
                            print(f"Lỗi insert: {e}")

            current_date += timedelta(days=1)

        conn.commit()
        print(f"\n=== TỔNG KẾT: Đã tạo {total_inserted} suất chiếu ===")
        print("Đã đảm bảo:")
        print("1. Phim Hot (Avatar, Phi vụ động trời...) có nhiều suất nhất.")
        print("2. Phim cũ/ít hot VẪN có suất chiếu (không bị bỏ rơi).")
        print("3. Thời gian và số lượng suất chiếu đa dạng.")

    except Exception as e:
        print(f"Lỗi hệ thống: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    generate_showtimes()