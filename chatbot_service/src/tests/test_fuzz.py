from thefuzz import process 

genres_db = ["Hành động", "Kinh dị", "Hoạt hình"]
ai_input = "xem phim hanh dong"

# extractOne sẽ tìm mục có điểm số cao nhất
best_match = process.extractOne(ai_input, genres_db)
# Kết quả: ('Hành động', 90) -> (Tên khớp, điểm số)
print(best_match)