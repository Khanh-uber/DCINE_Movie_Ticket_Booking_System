from database.db_config import get_connection
import json
from schemas.models import Movie, Showtime
from schemas.tool_input import *
from datetime import date, time, datetime
from Helper.get_verified_data import *
from schemas.tool_input import TimeSlot, ShowingStatus
from decimal import Decimal



def search_movies(genre: str = None, location: str = None, status: str = None,
                cinema_name: str = None , start_date : str = None , 
                time_slot=None, specific_time=None, **kwargs) -> str:
    extracted_data = locals()
    
    # Loại bỏ kwargs vì nó thường là dictionary rỗng hoặc chứa rác
    extracted_data.pop('kwargs', None)
    
    print(f"[BACKEND RECEIVE] Dữ liệu hàm nhận được: {extracted_data}")
    params = []
    applied_filters = {}
    #query ban dau 
    select_clause = "SELECT DISTINCT m.* FROM movie m"
    join_clause = " JOIN movie_genre mg ON mg.movie_id = m.movie_id"
    where_clause = " WHERE 1 = 1"


    # Xử lí genre m
    genre_id, genre_name = None, None
    if genre:
        genre_id, genre_name = get_verified_genre(genre)
        if not genre_id:
            result =  {
                "status": "error",
                "error_type": "invalid_genre",
                "message": f"Thể loại '{genre_name}' hiện không có trong danh mục của rạp.",
                "search_context": applied_filters
            }
            return json.dumps(result, ensure_ascii=False)
        # Nếu genre_id tồn tại thì lọc theo genre_id 
        elif genre_id:
            where_clause  += " AND mg.genre_id = %s"
            params.append(genre_id)
            applied_filters["genre"] = genre_name
    

    #Xử lí location 
    if location: 
        verified_loc = get_verified_location(location)
        if verified_loc:
            if "LEFT JOIN showtime s" not in join_clause:
                join_clause += """
                            LEFT JOIN showtime s ON s.movie_id = m.movie_id
                            LEFT JOIN hall h ON s.hall_id = h.hall_id
                            LEFT JOIN theater t ON h.theater_id = t.theater_id
                            LEFT JOIN location l ON t.location_id = l.location_id
                        """
            location_id = verified_loc["id"]
            loc_type = verified_loc["type"]

            if loc_type == "district":
                where_clause += " AND l.location_id = %s"
            else:
                where_clause += " AND l.province_id = %s"
            
            params.append(verified_loc["id"])
            applied_filters["location"] = verified_loc["name"]
        else:
        # TRƯỜNG HỢP KHÔNG TÌM THẤY ĐỊA ĐIỂM
            result =  {
                "status": "error",
                "message": f"Dạ, khu vực '{location}' hiện chưa có rạp chiếu nào thuộc hệ thống.",
                "search_context": {"location":location}
            }
            return json.dumps(result, ensure_ascii=False)
        

    # xử lí cinema_name 
    if cinema_name: 
        theater_id, theater_name = get_verified_theater_name(cinema_name)
        if theater_id :
            if "theater t" not in join_clause:
                join_clause += """
                    LEFT JOIN showtime s ON s.movie_id = m.movie_id
                    LEFT JOIN hall h ON s.hall_id = h.hall_id
                    LEFT JOIN theater t ON h.theater_id = t.theater_id
                """
            where_clause += " AND t.theater_id = %s"
            params.append(theater_id)
            applied_filters["cinema"] = theater_name 
        else:
            result = {
                "status": "error", 
                "message": f"Dạ, hệ thống không tìm thấy rạp '{cinema_name}' ạ.",
                "search_context": {"input_cinema": cinema_name}
            }
            return json.dumps(result, ensure_ascii=False)
        

    if start_date:
        if "join showtime s" not in join_clause.lower():
            join_clause += """
                LEFT JOIN showtime s ON s.movie_id = m.movie_id
            """
        where_clause += " AND DATE(s.start_at) = %s"
        params.append(start_date)
        applied_filters["date"] = str(start_date)


    # Xử lí time_slot 
    TIME_SLOT_MAPPING = {
        TimeSlot.MORNING: ("06:00:00", "11:59:59"),
        TimeSlot.LUNCH: ("12:00:00", "13:59:59"),
        TimeSlot.AFTERNOON: ("14:00:00", "17:59:59"),
        TimeSlot.EVENING: ("18:00:00", "22:59:59"),
        TimeSlot.LATE_NIGHT: ("23:00:00", "05:59:59")
    }
    if time_slot: 
        slot_data = TIME_SLOT_MAPPING.get(time_slot)
        if slot_data:
            start_time, end_time = slot_data
        
            if "join showtime s" not in join_clause.lower():
                join_clause += " LEFT JOIN showtime s ON s.movie_id = m.movie_id"
            where_clause += " AND TIME(s.start_at) BETWEEN %s AND %s"
            params.extend([start_time, end_time])
            applied_filters["time_slot"] = time_slot
        else: 
            pass 
    
    if specific_time:
        # Đảm bảo đã JOIN showtime s
        if "join showtime s" not in join_clause.lower():
            join_clause += " LEFT JOIN showtime s ON s.movie_id = m.movie_id"
        
        # Lọc các suất chiếu bắt đầu từ giờ đó trở đi trong ngày đã chọn
        where_clause += " AND TIME(s.start_at) >= %s"
        params.append(specific_time)
        
        applied_filters["specific_time"] = specific_time
    if status:
        where_clause += " AND m.status = %s"
        params.append(status)
            # Cập nhật filter để AI biết và phản hồi
        if status == ShowingStatus.NOW_SHOWING:
            applied_filters["status"] = "Đang chiếu"
        else:
            applied_filters["status"] = "Sắp chiếu"
    final_query = select_clause + join_clause + where_clause
    
    #Debug
    print(f"[SQL] Query: {final_query}")
    print(f"[SQL] Params: {params}")
    
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary = True)
        cur.execute(final_query, tuple(params))
        rows = cur.fetchall()
        
        conn.close()
        cur.close()
        if not rows:
            return json.dumps({
                "status": "empty",
                "action": "DISPLAY_MOVIE_LIST",
                "message": "Dạ, hiện tại hệ thống không tìm thấy phim nào phù hợp với yêu cầu của Thức.",
                "search_context": applied_filters,
                "data": [] # Trả mảng rỗng để Front-end biết đường xóa list phim cũ
            }, ensure_ascii=False)
        

        ai_friendly_movies = []
        frontend_only_movies = []
        for row in rows:
            # Chuyển row thành dictionary nếu chưa phải
            movie_dict = row
            
            # Duyệt qua từng cặp Key-Value trong movie
            for key, value in movie_dict.items():
                # Nếu gặp kiểu dữ liệu ngày tháng hoặc thời gian
                if isinstance(value, (date, datetime, time)):
                    movie_dict[key] = str(value) # Biến nó thành "2026-05-14"
                # Nếu gặp kiểu Decimal (thường là tiền vé)
                elif isinstance(value, Decimal):
                    movie_dict[key] = float(value) # Biến nó thành 75000.0
                    
            ai_friendly_movies.append({
                "id": movie_dict.get("movie_id"),
                "title": movie_dict.get("title")
            })

            frontend_only_movies.append(movie_dict)

        
        result = {
            "status": "success",
            "action": "DISPLAY_MOVIE_LIST",
            "message": f"Tìm thấy phim phù hợp.",
            "search_context": applied_filters,
            "movies_for_ai": ai_friendly_movies,  
            "frontend_data": frontend_only_movies    
        }
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        print(f"[ERROR] Database Error: {str(e)}")
        error_res = {
            "status": "error",
            "message": "Dạ, hệ thống đang gặp chút sự cố khi truy xuất dữ liệu, Thức vui lòng thử lại sau nhé!",
        }
        return json.dumps(error_res, ensure_ascii=False)
    


def find_showtimes(movie_id: str = None,
    movie_name: str = None,
    cinema_id: str = None,
    location: str = None,
    cinema_name: str = None,
    start_date: date = None,
    end_date: date = None,
    target_time: str = None,
    min_time: str = None,
    max_time: str = None,
    time_slot: str = None,
                   **kwargs) -> str:
    
    """
    Logic: Tìm lịch chiếu dựa trên phim và rạp cụ thể.
    """
    params = []
    applied_filters = {}

    select_clause = """
        SELECT s.showtime_id, s.start_at,
            m.title as movie_name, 
            t.name as theater_name, 
            h.name as hall_name,
            l.city_name as location_name
    """
    from_clause = " FROM showtime s"
    join_clause = """
        JOIN movie m ON s.movie_id = m.movie_id
        JOIN hall h ON s.hall_id = h.hall_id
        JOIN theater t ON h.theater_id = t.theater_id
        JOIN location l ON t.location_id = l.location_id
    """
    where_clause = " WHERE 1 = 1"
    if movie_id:
        where_clause += " AND s.movie_id = %s"
        params.append(movie_id)
        applied_filters["movie_id"] = movie_id
    elif movie_name: 
        m_id, m_name = get_verified_movie_name(movie_name)
        if m_id:
            where_clause += " AND s.movie_id = %s"
            params.append(m_id)
            applied_filters["movie"] = m_name
        else:
            return json.dumps({
            "status": "error",
            "message": f"Dạ, hệ thống không tìm thấy phim này, Thức thử tìm tên khác xem sao nhé!",
            "search_context": {"movie_name": movie_name}
        }, ensure_ascii=False)
    
    theater_found = False
    if cinema_id:
            where_clause += " AND t.theater_id = %s"
            params.append(cinema_id)
            applied_filters["theater_id"] = cinema_id 
            theater_found = True
    if not theater_found and cinema_name:
        t_id, t_name = get_verified_theater_name(cinema_name)
        if t_id:
            where_clause += " AND t.theater_id = %s"
            params.append(t_id)
            applied_filters["theater"] = t_name
            theater_found = True
        else:
            return json.dumps({
                "status": "error",
                "message": f"Dạ, hệ thống không tìm thấy rạp '{cinema_name}' ạ.",
                "search_context": {"cinema_name": cinema_name}
            }, ensure_ascii=False)
    if not theater_found and location:
        verified_loc = get_verified_location(location)
        if verified_loc:
            # Xác định lọc theo Quận (location_id) hay Tỉnh (province_id)
            if verified_loc["type"] == "district":
                where_clause += " AND l.location_id = %s"
            else:
                where_clause += " AND l.province_id = %s"
            params.append(verified_loc["id"])
            applied_filters["location"] = verified_loc["name"]
        else:
            return json.dumps({
                "status": "error",
                "message": f"Dạ, em không tìm thấy khu vực '{location}' trong hệ thống rạp.",
                "search_context": {"location": location}
            }, ensure_ascii=False)
    
    # Xử lí date_range 
    if start_date and end_date :
        where_clause += " AND DATE(s.start_at) BETWEEN %s AND %s"
        params.extend([start_date, end_date])
        applied_filters["date_range"] = f"Từ {start_date} đến {end_date}"
    elif start_date:
        where_clause += " AND DATE(s.start_at) = %s"
        params.append(start_date)
        applied_filters["date"] = str(start_date)
    # ví dụ "Tìm phim chiếu trước ngày 20/5"
    elif end_date:
        where_clause += " AND DATE(s.start_at) <= %s"
        params.append(end_date)
        applied_filters["end_date"] = str(end_date)
    elif not start_date and not end_date:
        today = datetime.now().date()
        where_clause += " AND DATE(s.start_at) = %s"
        params.append(today)
        applied_filters["date"] = "Hôm nay"

    now = datetime.now()
    current_date = now.date()
    current_time = now.strftime("%H:%M:%S")
    search_date = start_date if start_date else current_date
    is_today = str(search_date) == str(current_date)
    # Xử lí target_time
    if target_time:
        if is_today:
            # Nếu khách tìm giờ đã qua, tự động lọc từ giờ hiện tại
            effective_time = max(target_time, current_time)
        else:
            effective_time = target_time

        where_clause += " AND TIME(s.start_at) >= %s"
        params.append(effective_time)
        applied_filters["target_time"] = target_time
    
    if min_time and max_time:
        effective_min = max(min_time, current_time) if is_today else min_time
        if is_today and current_time > max_time:
            return json.dumps({
                "status": "empty",
                "message": f"Dạ Thức ơi, các suất chiếu trong khoảng từ {min_time} đến {max_time} hôm nay đều đã chiếu xong rồi ạ.",
                "search_context": {"min_time": min_time, "max_time": max_time}
            }, ensure_ascii=False)
        where_clause += " AND TIME(s.start_at) BETWEEN %s AND %s"
        params.extend([effective_min, max_time])
        applied_filters["time_range"] = f"Từ {effective_min} đến {max_time}"
    elif min_time:
        effective_min = max(min_time, current_time) if is_today else min_time
        where_clause += " AND TIME(s.start_at) >= %s"
        params.append(effective_min)
        applied_filters["min_time"] = effective_min
    elif max_time:
        if is_today:
            if current_time >= max_time:
                return json.dumps({
                    "status": "empty",
                    "message": f"Dạ, các suất chiếu trước {max_time} hôm nay đã qua rồi ạ.",
                    "search_context": {"max_time": max_time}
                }, ensure_ascii=False)
            where_clause += " AND TIME(s.start_at) BETWEEN %s AND %s"
            params.extend([current_time, max_time])
        else:
            where_clause += " AND TIME(s.start_at) <= %s"
            params.append(max_time)
            applied_filters["max_time"] = max_time
    TIME_SLOT_MAPPING = {
        TimeSlot.MORNING: ("06:00:00", "11:59:59"),
        TimeSlot.LUNCH: ("12:00:00", "13:59:59"),
        TimeSlot.AFTERNOON: ("14:00:00", "17:59:59"),
        TimeSlot.EVENING: ("18:00:00", "22:59:59"),
        TimeSlot.LATE_NIGHT: ("23:00:00", "05:59:59")
    }
    if time_slot:
        slot_data = TIME_SLOT_MAPPING.get(time_slot.upper())
        if slot_data:
            slot_start, slot_end = slot_data

            effective_start = slot_start
            if is_today:
                if current_time > slot_end:
                        return json.dumps({
                            "status": "empty",
                            "message": f"Các suất chiếu {time_slot.lower()} hôm nay đều đã chiếu xong rồi ạ.",
                            "search_context": {"time_slot": time_slot}
                        }, ensure_ascii=False)
                effective_start = max(slot_start, current_time)
            where_clause += " AND TIME(s.start_at) BETWEEN %s AND %s"
            params.extend([effective_start, slot_end])
            applied_filters["time_slot"] = time_slot
            

    final_query = final_query = select_clause + from_clause + join_clause + where_clause + " ORDER BY s.start_at ASC"

    # Debug xem câu Query và Params chạy thực tế như thế nào
    print(f"[SQL Find Showtimes] Query: {final_query}")
    print(f"[SQL Find Showtimes] Params: {params}")

    try:
        conn = get_connection()
        cur = conn.cursor(dictionary = True)
        cur.execute(final_query, tuple(params))
        rows = cur.fetchall()
        conn.close()
        cur.close()
        clean_rows = []
        for row in rows:
            # Nếu dùng cursor(dictionary=True) thì row đã là dict, nếu chưa thì dùng dict(row)
            showtime_dict = row 
            
            for key, value in showtime_dict.items():
                if isinstance(value, (datetime, date, time)):
                    showtime_dict[key] = str(value)
                elif isinstance(value, Decimal):
                    showtime_dict[key] = float(value)
                    
            clean_rows.append(showtime_dict)

        # 4. Đóng gói kết quả đầu ra
        result = {
            "status": "success" if clean_rows else "empty",
            "message": f"Tìm thấy {len(clean_rows)} suất chiếu phù hợp." if clean_rows else "Dạ, hiện tại khung giờ hoặc rạp này không có suất chiếu nào phù hợp rồi ạ.",
            "search_context": applied_filters,
            "data": clean_rows
        }
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        # Xử lý nếu có lỗi Database phát sinh đột xuất
        print(f"[ERROR Find Showtimes]: {str(e)}")
        error_res = {
            "status": "error",
            "message": "Dạ, hệ thống gặp sự cố khi tìm lịch chiếu, Thức vui lòng thử lại sau nhé!",
        }
        return json.dumps(error_res, ensure_ascii=False)
def get_movie_detail(movie_id: int = None, movie_name: str = None):
    select_clause = """
        SELECT 
            m.*,
            GROUP_CONCAT(DISTINCT 
                CASE WHEN cp.role_type = 'director' THEN cp.name END
                SEPARATOR ', '
            ) AS directors,
            GROUP_CONCAT(DISTINCT 
                CASE WHEN cp.role_type = 'actor' THEN cp.name END
                SEPARATOR ', '
            ) AS actors,
            GROUP_CONCAT(DISTINCT g.name SEPARATOR ', ') AS genres
        FROM movie m
        LEFT JOIN movie_cast mc ON mc.movie_id = m.movie_id
        LEFT JOIN cast_person cp ON cp.cast_id = mc.cast_id
        LEFT JOIN movie_genre mg ON mg.movie_id = m.movie_id
        LEFT JOIN genre g ON g.genre_id = mg.genre_id
    """
    where_clause = " WHERE 1=1"
    params = []
    applied_filters = {}
    if movie_id:
        where_clause += " AND m.movie_id = %s"
        params.append(movie_id)
        applied_filters["movie_id"] = movie_id
    elif movie_name:
        mv_id, title  = get_verified_movie_name(movie_name)
        if mv_id:
            where_clause += " AND m.movie_id = %s"
            params.append(mv_id) # Chuyển sang lọc bằng ID cho câu Query chính chạy siêu nhanh (Tối ưu Index)
            applied_filters["movie_name"] = title
        else:
            # Trả về lỗi nếu khách gõ tên phim không tồn tại trong hệ thống rạp
            return json.dumps({
                "status": "error",
                "message": f"Dạ, hiện tại rạp bên em không có phim '{movie_name}' rồi ạ. Thức kiểm tra lại tên phim nhé!",
                "search_context": {"input_movie_name": movie_name}
            }, ensure_ascii=False)
    else:
        return json.dumps({"status": "error", "message": "Chưa chọn phim cụ thể."}, ensure_ascii=False)
    
    group_by_clause = " GROUP BY m.movie_id LIMIT 1"

    final_query = select_clause + where_clause + group_by_clause

    # Debug xem câu Query và Params chạy thực tế như thế nào
    print(f"[SQL Find Showtimes] Query: {final_query}")
    print(f"[SQL Find Showtimes] Params: {params}")
    try:
        
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(final_query, tuple(params))
        row = cur.fetchone()
        conn.close()
        cur.close()

        if not row:
            return json.dumps({
                "status": "empty",
            }, ensure_ascii=False)
        
        movie_detail = dict(row)
        for key, value in movie_detail.items():
            if isinstance(value, (datetime, date, time)):
                movie_detail[key] = str(value)
            elif isinstance(value, Decimal):
                movie_detail[key] = float(value)

        return json.dumps({
            "status": "success",
            "message": f"Tải thông tin phim {movie_detail['title']} thành công.",
            "search_context": applied_filters,
            "data": movie_detail # Trả về mảng 1 phần tử chứa đầy đủ dàn Cast
        }, ensure_ascii=False)
    except Exception as e:
        print(f"[ERROR get_movie_detail with Cast]: {str(e)}")
        return json.dumps({"status": "error", "message": "Lỗi hệ thống.", "error_detail": str(e)}, ensure_ascii=False)
    
def get_ticket_prices(showtime_id: int = None, movie_name: str = None, theater_name: str = None, audience_type: str = None, **kwargs) -> str:
    
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        verified_movie_id = None
        verified_theater_id = None
        if movie_name:
            v_movie_id, v_movie_title = get_verified_movie_name(movie_name)
            if v_movie_id:
                verified_movie_id = v_movie_id
        if theater_name:
            v_theater_id, v_theater_name = get_verified_theater_name(theater_name)
            if v_theater_id:
                verified_theater_id = v_theater_id
        if not showtime_id and (verified_movie_id or verified_theater_id):
            sub_select = "SELECT s.showtime_id"
            sub_from = "FROM showtime s"
            sub_joins = []
            if verified_theater_id:
                sub_joins.append("JOIN hall h ON s.hall_id = h.hall_id")
            sub_wheres = ["s.start_at >= NOW()"]
            sub_params = []


            if verified_movie_id:
                # Dùng toán tử = tuyệt đối với ID phim, cực kỳ nhanh!
                sub_wheres.append("s.movie_id = %s")
                sub_params.append(verified_movie_id)
            if verified_theater_id:
                # Dùng toán tử = tuyệt đối với ID rạp thông qua bảng phòng (hall)
                sub_wheres.append("h.theater_id = %s")
                sub_params.append(verified_theater_id)
            sub_query = f"""
                {sub_select}
                {sub_from}
                {" ".join(sub_joins)}
                WHERE {" AND ".join(sub_wheres)}
                ORDER BY s.start_at ASC LIMIT 1
            """

            cur.execute(sub_query, tuple(sub_params))
            row = cur.fetchone()
            if row:
                showtime_id = row["showtime_id"] if isinstance(row, dict) else row[0]

        if not showtime_id:
            return json.dumps({
                "status": "error",
                "message": "Dạ Thức ơi, bạn vui lòng cho em xin tên phim hoặc rạp cụ thể để em tính giá vé chính xác nhé."
            }, ensure_ascii=False)
        

        select_clause = """
            SELECT DISTINCT
                s.showtime_id,
                s.base_price,
                st.name AS seat_type_name,
                st.price_multiplier,
                m.title AS movie_title,
                t.name AS theater_name
        """
        from_clause = "FROM showtime s"

        # Vì tính toán giá cho tất cả loại ghế hiện có, ta dùng CROSS JOIN với bảng seat_type
        join_clauses = [
            "JOIN movie m ON s.movie_id = m.movie_id",
            "JOIN hall h ON s.hall_id = h.hall_id",
            "JOIN theater t ON h.theater_id = t.theater_id",
            "JOIN seat se ON h.hall_id = se.hall_id",
            "JOIN seat_type st ON se.seat_type_id = st.seat_type_id"
        ]
        
        where_clauses = ["s.showtime_id = %s"]
        main_params = [showtime_id]

        # ==========================================================
        # BƯỚC 3: HỢP NHẤT KHỐI VÀ THỰC THI TRUY VẤN
        # ==========================================================
        full_join = "\n\t".join(join_clauses)
        full_where = " AND ".join(where_clauses)
        
        main_query = f"""
            {select_clause}
            {from_clause}
            {full_join}
            WHERE {full_where}
        """
        
        cur.execute(main_query, tuple(main_params))
        rows = cur.fetchall()
        
        if not rows:
            return json.dumps({"status": "empty", "message": "Suất chiếu này chưa được cấu hình bảng giá hệ thống."}, ensure_ascii=False)
        audiences = {
            AudienceEnum.NGUOI_LON.value: {"discount_rate": 1.0}, # "Người lớn"
            AudienceEnum.TRE_EM.value: {"discount_rate": 0.8}    # "Trẻ em"
        }
        
        # Nếu khách hoặc AI truyền đích danh nhóm đối tượng, lọc bớt để trả về trúng đích
        if audience_type:
            aud_value = audience_type.value if isinstance(audience_type, Enum) else audience_type
            audiences = {k: v for k, v in audiences.items() if aud_value.lower() in k.lower()}

        calculated_prices = []
        for row in rows:
            r_data = dict(row) if isinstance(row, dict) else dict(zip([col[0] for col in cur.description], row))
            
            base_price = float(r_data["base_price"])
            multiplier = float(r_data["price_multiplier"])
            seat_type_name = r_data["seat_type_name"]

            ticket_price_for_adult = base_price * multiplier
            for aud_name, aud_cfg in audiences.items():
                # Công thức: (Giá nền của suất * Hệ số ghế) - Tiền giảm giá đối tượng
                final_price = ticket_price_for_adult * aud_cfg["discount_rate"]
                
                calculated_prices.append({
                    "movie_title": r_data["movie_title"],
                    "theater_name": r_data["theater_name"],
                    "seat_type": r_data["seat_type_name"],
                    "audience_group": aud_name,
                    "ticket_price": final_price
                })
                
        # Sắp xếp tăng dần theo giá tiền để AI đọc được mức giá thấp nhất (giá sàn) dễ dàng
        calculated_prices.sort(key=lambda x: x["ticket_price"])

        return json.dumps({
            "status": "success",
            "showtime_id": showtime_id,
            "data": calculated_prices
        }, ensure_ascii=False)
        
    except Exception as e:
        print(f"[ERROR get_ticket_price]: {e}")
        return json.dumps({"status": "error", "message": f"Lỗi hệ thống khi tính giá vé: {str(e)}"}, ensure_ascii=False)
    finally:
        conn.close()
        cur.close()
def get_seat_map(showtime_id: str, **kwargs) -> str:
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        if not showtime_id:
            return json.dumps({
                "status": "error", 
                "message": "Dạ Thức ơi, em cần có mã suất chiếu cụ thể thì mới lên sơ đồ ghế cho mình được nè."
            }, ensure_ascii=False)
        query = """
            SELECT 
                se.seat_id,
                st.name AS type,
                CASE 
                    WHEN bs.seat_id IS NOT NULL THEN 'B' -- BOOKED (Đã đặt)
                    ELSE 'A' -- AVAILABLE (Còn trống)
                END AS status
            FROM showtime s
            JOIN hall h ON s.hall_id = h.hall_id
            JOIN seat se ON h.hall_id = se.hall_id
            JOIN seat_type st ON se.seat_type_id = st.seat_type_id
            LEFT JOIN booking b ON s.showtime_id = b.showtime_id
            LEFT JOIN booking_seat bs ON b.booking_id = bs.booking_id AND se.seat_id = bs.seat_id
            WHERE s.showtime_id = %s
        """
        cur.execute(query, (showtime_id,))
        seats = cur.fetchall()

        if not seats:
            return json.dumps({
                "status": "empty", 
                "action": "OPEN_SEAT_MAP",
                "showtime_id": showtime_id,
                "message": "Suất chiếu này chưa được cấu hình sơ đồ ghế."
            }, ensure_ascii=False)
        booked_seats_list = [s["seat_id"] for s in seats if s["status"] == "B"]

        total_seats = len(seats)
        available_seats = len([s for s in seats if s["status"] == "A"])

        std_total = len([s for s in seats if s["type"] == "Standard"])
        std_booked = len([s for s in seats if s["type"] == "Standard" and s["status"] == "B"])
        std_available = std_total - std_booked
        
        if std_available == 0:
            std_status = "Đã hết sạch ghế Standard"
        elif std_available <= 5:
            std_status = "Sắp cháy vé (Còn dưới 5 chỗ)"
        else:
            std_status = "Còn nhiều chỗ giá hạt dẻ"

        vip_total = len([s for s in seats if s["type"] == "VIP"])
        vip_booked = len([s for s in seats if s["type"] == "VIP" and s["status"] == "B"])
        vip_available = vip_total - vip_booked
        
        if vip_available == 0:
            vip_status = "Đã hết sạch ghế VIP"
        elif vip_available <= 5:
            vip_status = "Sắp cháy vé (Còn dưới 5 chỗ)"
        else:
            vip_status = "Còn nhiều chỗ view chính diện"

        # 3. Kiểm tra trạng thái hàng ghế COUPLE (Ghế đôi hàng I-J)
        couple_total = len([s for s in seats if s["type"] == "Couple"])
        couple_booked = len([s for s in seats if s["type"] == "Couple" and s["status"] == "B"])
        couple_available = couple_total - couple_booked
        
        if couple_available == 0:
            couple_status = "Đã hết sạch ghế Couple"
        elif couple_available <= 2:
            couple_status = "Chỉ còn 1-2 cặp cuối cùng"
        else:
            couple_status = "Vẫn còn không gian riêng tư"

        return json.dumps({
            "status": "success",
            "action": "OPEN_SEAT_MAP",
            "showtime_id": showtime_id,
            "summary": {
                "total_seats": total_seats,
                "available_seats": available_seats,
                "standard_status": std_status, 
                "vip_status": vip_status,
                "couple_status": couple_status 
            },
            # Cục này bốc POP ra ném thẳng về cho Frontend JavaScript vẽ
            "frontend_data": {
                "booked_seats": booked_seats_list
            }
        }, ensure_ascii=False)
    except Exception as e:
        print(f"[ERROR get_seat_map]: {e}")
        return json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False)
    finally:
        cur.close()
        conn.close()


    
AVAILABLE_TOOLS = {
    "search_movies": search_movies,
    "find_showtimes": find_showtimes,
    "get_movie_detail" : get_movie_detail,
    "get_ticket_prices" : get_ticket_prices,
    "get_seat_map": get_seat_map
    
}
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_movies",
            "description": "Dùng để tìm danh sách phim dựa trên các tiêu chí chung như thể loại, địa điểm, trạng thái (đang chiếu/sắp chiếu). Kích hoạt khi người dùng muốn tìm phim nhưng CHƯA có tên phim cụ thể.",
            "parameters": SearchMoviesInput.model_json_schema() 
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_showtimes",
            "description": "Dùng để tra cứu lịch chiếu, suất chiếu, giờ chiếu cụ thể. Kích hoạt khi người dùng ĐÃ BIẾT TÊN PHIM và muốn biết 'mấy giờ', 'ở đâu', 'khi nào'.",
            "parameters": FindShowtimesInput.model_json_schema()
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_movie_detail",
            "description": "Dùng để lấy thông tin chi tiết về một bộ phim cụ thể (nội dung, diễn viên, đạo diễn, thời lượng). Kích hoạt khi người dùng hỏi 'nội dung phim này là gì?', 'phim này có hay không?'.",
            "parameters": GetMovieDetailsInput.model_json_schema()
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_ticket_prices",
            "description": "Dùng để tra cứu giá vé. Kích hoạt khi người dùng hỏi 'giá vé bao nhiêu?', 'vé VIP giá sao?'.",
            "parameters": GetTicketPriceInput.model_json_schema()
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_seat_map",
            "description": "Dùng để lấy sơ đồ ghế ngồi của một suất chiếu. Kích hoạt khi người dùng muốn 'xem ghế trống', 'chọn ghế'.",
            "parameters": GetSeatMapInput.model_json_schema()
        }
    }
]

if __name__ == "__main__":
    # Thay số 45 bằng một showtime_id thực tế có trong Database của Thức nhé
    test_showtime_id = 45 
    
    print("--- CHẠY THỬ HÀM GET_SEAT_MAP SIÊU NẾN ---")
    raw_output = get_seat_map(showtime_id=test_showtime_id)
    
    # Ép kiểu ngược lại về Dict để in ra màn hình cho đẹp mắt
    import json
    parsed_json = json.loads(raw_output)
    print(json.dumps(parsed_json, indent=4, ensure_ascii=False))