from rapidfuzz import process, fuzz
from database.get_data import *
from Helper.normalize_data import normalize_text

def get_verified_genre(ai_input_genre):
    if not ai_input_genre or ai_input_genre.strip() == "":
        return None, None

    genre_map = get_all_genres()
    print(genre_map)
    if not genre_map:
        print("Cảnh báo: Không lấy được danh sách genre từ Database.")
        return None, None
    normalized_map = {
        normalize_text(name): (name, genre_id)
        for name, genre_id in genre_map.items()
    }

    choices = list(normalized_map.keys())

    input_norm = normalize_text(ai_input_genre)

    print("input_norm:", input_norm)
    
    best_match, score, _ = process.extractOne(
        input_norm,
        choices,
        scorer=fuzz.token_set_ratio
    )
    # In thông tin debug ngầm để Thức theo dõi điểm số vật lý
    print(f"   [Fuzzy Debug] Tìm thấy gần nhất: '{best_match}' | Điểm khớp: {score:.1f}%")
    if score >= 80:
        original_name, genre_id = normalized_map[best_match]
        return genre_id, original_name
    
    return None, None
def get_verified_location(ai_input_location: str):
    if not ai_input_location or ai_input_location.strip() == "":
        return None, None, None
    
    location_map = get_unified_location_map()
    normalized_choices = {normalize_text(name): name for name in location_map.keys()}
    print(normalized_choices)
    choices = list(normalized_choices.keys())

    # Chuẩn hóa chuỗi đầu vào từ AI
    input_norm = normalize_text(ai_input_location)
    best_match, score, _ = process.extractOne(
        input_norm, 
        choices, 
        scorer=fuzz.token_set_ratio
    )
    print(f"   [Fuzzy Location] Đã gộp sạch: '{input_norm}' -> Khớp: '{best_match}' ({score:.1f}%)")
    if (score >= 80):
        original_name = normalized_choices[best_match]
        result = location_map[original_name]
        return {
            "id": result["id"],
            "name": original_name,
            "type": result["type"]
        }
    return None
def get_verified_theater_name(ai_input_theatername:str):
    if not ai_input_theatername or ai_input_theatername.strip() == "":
        return None, None
    theater_map = get_all_theaters_map()
    normalized_map =  {
        normalize_text(theater_name): (theater_name, theater_id)
        for theater_name, theater_id in theater_map.items()
    }
    choices = list(normalized_map.keys())
    input_norm = normalize_text(ai_input_theatername)
    best_match, score, _ = process.extractOne(
        input_norm,
        choices,
        scorer=fuzz.token_set_ratio 
    )

    if score >= 70:
        verified_name, theater_id = normalized_map[best_match]
        return theater_id, verified_name
    
    return None, None
def get_verified_movie_name(ai_input_moviename:str):
    if not ai_input_moviename or ai_input_moviename.strip() == "":
        return None, None
    movie_map = get_all_movies()
    normalized_map = {
        normalize_text(title): (title, id)
        for title, id in movie_map.items()
    }
    choices = list(normalized_map.keys())
    input_norm = normalize_text(ai_input_moviename)

    best_match, score, _ = process.extractOne(
        input_norm,
        choices,
        scorer=fuzz.token_set_ratio 
    )
    if score >= 70:
        title, id = normalized_map[best_match]
        return id , title
    
    return None, None