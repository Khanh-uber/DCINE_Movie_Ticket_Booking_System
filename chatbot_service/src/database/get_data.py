from database.db_config import get_connection
def get_all_genres():
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        
        query = "SELECT genre_id, name FROM genre"
        cur.execute(query)
        
        genres_db = cur.fetchall()
        results = {g["name"]: g["genre_id"] for g in genres_db}
        return results

    except Exception as e:
        print(f"Lỗi truy vấn DB: {e}")
        return {} 
        
    finally:
        # BẮT BUỘC phải đóng để giải phóng tài nguyên
        if conn and conn.is_connected():
            cur.close()
            conn.close()

def get_unified_location_map():
    conn = None
    unified_map = {}

    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        query_loc = "SELECT location_id, city_name FROM location"
        cur.execute(query_loc)
        locations = cur.fetchall()

        for loc in locations:
            unified_map[loc['city_name']] = {
                "id": loc['location_id'], 
                "type": "district"
            }
        
        query_prov = "SELECT province_id, province_name FROM province"
        cur.execute(query_prov)
        provinces = cur.fetchall()
        for prov in provinces:
            unified_map[prov['province_name']] = {
                "id": prov['province_id'], 
                "type": "province"
            }
        return unified_map
    except Exception as e:
        print(f"Lỗi khi lấy bản đồ địa điểm: {e}")
        return {}
    finally:
        if conn and conn.is_connected():
            cur.close()
            conn.close()
def get_all_theaters_map():
    conn = None 
    map = {}

    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        query = "select * from theater"
        cur.execute(query)
        theaters  = cur.fetchall()

        for t in theaters:
            map[t['name']] = t['theater_id']
        return map
    except Exception as e:
        print(f"Lỗi khi lấy tên rạp: {e}")
        return {}
    finally:
        if conn and conn.is_connected():
            cur.close()
            conn.close()
def get_all_movies():
    conn = None 
    map = {}

    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        query = "select * from movie"
        cur.execute(query)
        movies  = cur.fetchall()

        for m in movies:
            map[m['title']] = m['movie_id']
        return map
    except Exception as e:
        print(f"Lỗi khi lấy tên phim: {e}")
        return {}
    finally:
        if conn and conn.is_connected():
            cur.close()
            conn.close()
