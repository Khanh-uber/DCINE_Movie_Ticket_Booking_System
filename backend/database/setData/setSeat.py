import pymysql
import json

# =========================
#  CONFIG DB
# =========================
conn = pymysql.connect(
    host="localhost",
    user="root",
    password="123456",
    database="dcine_schema",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor
)
cursor = conn.cursor()

print("\n===== GENERATE SEATS FOR ALL HALLS USING 2D-Layout-B =====\n")

# =========================
# 1️⃣ LẤY LAYOUT 2D-B TỪ DB
# =========================
cursor.execute("""
    SELECT seat_layout_id, layout_map
    FROM seat_layout
    WHERE name = '2D-Layout-B'
""")
layout_data = cursor.fetchone()

if not layout_data:
    print("❌ Không tìm thấy layout '2D-Layout-B' trong DB.")
    exit()

layout = json.loads(layout_data["layout_map"])

rows = layout["rows"]                    # ["A","B",...,"J"]
columns = layout["columns"]              # 16
blocks = layout["blocks"]                # [4,8,4]
seat_types_map = layout["seat_types"]    # seat type mapping

# =========================
# 2️⃣ MAP row_label -> seat_type_name
# =========================
row_seat_type = {}

for key, seat_type_name in seat_types_map.items():
    row_list = key.split(",")
    for r in row_list:
        row_seat_type[r] = seat_type_name

# =========================
# 3️⃣ MAP seat_type_name -> seat_type_id
# =========================
cursor.execute("SELECT seat_type_id, name FROM seat_type")
type_rows = cursor.fetchall()

SEAT_TYPE_MAP = {row["name"]: row["seat_type_id"] for row in type_rows}

# =========================
# 4️⃣ LẤY TẤT CẢ HALL
# =========================
cursor.execute("SELECT hall_id, name FROM hall")
halls = cursor.fetchall()

# =========================
# 6️⃣ GENERATE GHẾ CHO TỪNG HALL
# =========================
created_total = 0

for hall in halls:
    hid = hall["hall_id"]
    hname = hall["name"]

    print(f"➡ Đang tạo lại ghế cho Hall {hid} ({hname})...")

    for row_label in rows:
        seat_type_name = row_seat_type[row_label]
        seat_type_id = SEAT_TYPE_MAP[seat_type_name]

        for seat_num in range(1, columns + 1):
            cursor.execute("""
                INSERT INTO seat (hall_id, row_label, seat_number, seat_type_id)
                VALUES (%s, %s, %s, %s)
            """, (hid, row_label, seat_num, seat_type_id))

            created_total += 1

    conn.commit()
    print(f"   ✔ Tạo xong 160 ghế cho Hall {hid}")

conn.close()

print(f"\n🎉 DONE! Đã tạo lại tổng cộng {created_total} ghế cho tất cả hall.")
