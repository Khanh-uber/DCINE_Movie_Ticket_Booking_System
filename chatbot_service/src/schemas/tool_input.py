from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

from enum import Enum
class ShowingStatus(str, Enum):
    NOW_SHOWING = "now"   # Phim đang chiếu
    COMING_SOON = "soon"   # Phim sắp chiếu
class SortOption(str, Enum):
    TIME_ASC = "TIME_ASC"
    PRICE_ASC = "PRICE_ASC"
    DISTANCE_ASC = "DISTANCE"
class TimeSlot(str, Enum):
    MORNING = "Sáng"        # 06:00 - 11:59
    LUNCH = "Trưa"          # 12:00 - 13:59 (Thường là suất trưa tranh thủ)
    AFTERNOON = "Chiều"     # 14:00 - 17:59
    EVENING = "Tối"         # 18:00 - 22:59 (Khung giờ vàng)
    LATE_NIGHT = "Khuya"    # 23:00 - 05:59 (Suất chiếu muộn)
class SeatType(str, Enum):
    STANDARD = "STANDARD"  # Ghế thường
    VIP = "VIP"            # Ghế VIP
    COUPLE = "COUPLE"      # Ghế đôi (Sweetbox)
class SeatStatus(str, Enum):
    AVAILABLE = "AVAILABLE" # Ghế còn trống
    BOOKED = "BOOKED"       # Ghế đã có người đặt
    HOLDING = "HOLDING"     # Ghế đang được giữ (chờ thanh toán)
class AudienceEnum(str, Enum):
    NGUOI_LON = "Người lớn"
    TRE_EM = "Trẻ em"
class SearchMoviesInput(BaseModel):
    """Dùng khi khách muốn tìm danh sách phim theo thể loại, trạng thái hoặc tìm kiếm chung chung khi chưa chọn được phim cụ thể."""
    movie_name: Optional[str] = Field(None, description = "Tên phim khách muốn tìm.")
    genre: Optional[str] = Field(
        None, 
        description="Thể loại phim khách muốn tìm. Hãy chọn từ danh sách hợp lệ như: "
                    "[Hành động, Hoạt hình, Kinh dị, Hài hước, Tình cảm, ...] "
                    "và các thể loại phổ thông khác. Nếu khách nói thể loại lạ, hãy cứ gửi nguyên văn."
    )

    location: Optional[str] = Field(
        None, 
        description="Quận/Huyện hoặc Thành phố (Vd: Quận 1, Hà Nội). Không bao gồm tên rạp tại đây."
    )

    cinema_name: Optional[str] = Field(
        None, 
        description="Tên thương hiệu rạp hoặc rạp cụ thể (Vd: CGV, Lotte Cinema, Galaxy Nguyễn Du)."
    )

    start_date: Optional[date] = Field(
        None, 
        description="Ngày bắt đầu (YYYY-MM-DD). Nếu khách nói 'hôm nay', hãy dùng ngày hệ thống."
    )

    end_date: Optional[date] = Field(
        None, 
        description="Ngày kết thúc (YYYY-MM-DD). Dùng khi khách muốn tìm phim trong một khoảng thời gian."
    )

    status: Optional[ShowingStatus] = Field(
        ShowingStatus.NOW_SHOWING, 
        description="Trạng thái phim. Nếu khách hỏi phim 'đang chiếu' hoặc không nói gì, dùng NOW_SHOWING. Chỉ dùng COMING_SOON nếu khách hỏi đích danh phim 'sắp ra mắt' hoặc 'sắp chiếu'"
    )

    time_slot: Optional[str] = Field(
        None, 
        description="Khung giờ tương đối (Sáng, Trưa, Chiều, Tối). Chỉ dùng khi không có specific_time."
    )

    specific_time: Optional[str] = Field(
        None, 
        pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$",
        description="Giờ cụ thể (HH:mm) hệ 24h. Ví dụ: '8 giờ tối' -> '20:00'."
    )
class FindShowtimesInput(BaseModel):
    """Dùng khi khách hỏi về giờ chiếu, suất chiếu hoặc lịch chiếu của một bộ phim cụ thể ."""

    movie_id: Optional[str] = Field(
        None, 
        description="ID của bộ phim khách muốn xem."
    )
    movie_name: str = Field(..., description="Tên của bộ phim khách muốn xem")
    
    location: str = Field(
        ..., 
        description="Quận/Huyện hoặc Thành phố khách muốn xem rạp ở đó."
    )
    cinema_id : Optional[str] = Field(None, description = "ID của rạp muốn xem.")
    cinema_name: Optional[str] = Field(
        None, 
        description="Tên rạp cụ thể ."
    )
    start_date: Optional[date] = Field(default_factory=date.today, 
        description="Ngày xem phim. BẮT BUỘC dùng ngày hôm nay nếu khách không nêu ngày cụ thể.")
    end_date : Optional[date] = Field(None,description="Ngày kết thúc suất chiếu (YYYY-MM-DD).")
    target_time: Optional[str] = Field(None, pattern=r"^[0-2]\d:[0-5]\d$", description="Giờ cụ thể muốn xem (HH:mm).")
    min_time: Optional[str] = Field(None, pattern=r"^[0-2]\d:[0-5]\d$", description="Không tìm suất chiếu trước giờ này.")
    max_time: Optional[str] = Field(None, pattern=r"^[0-2]\d:[0-5]\d$", description="Không tìm suất chiếu sau giờ này.")
    time_slot: Optional[TimeSlot] = Field(None, description="Khung giờ tương đối. Tự phân loại 'buổi sáng', 'buổi tối' vào các giá trị tương ứng.")
                    
    # --- NHÓM TÙY CHỌN & CHẤT LƯỢNG ---
    format: Optional[str] = Field(None, description="Định dạng phòng chiếu (2D, 3D, IMAX, Gold Class).")
    seat_type: Optional[str] = Field(None, description="Loại ghế (Thường, VIP, Couple).")
    
    sort_by: Optional[SortOption] = Field(SortOption.TIME_ASC, description="Tiêu chí sắp xếp kết quả.")
    
    check_availability: bool = Field(False, description="Chỉ hiện các suất còn chỗ trống (True/False).")



class GetSeatMapInput(BaseModel):
    """Tham số để lấy sơ đồ ghế ngồi của một suất chiếu."""

    showtime_id: str = Field(
        None, 
        description="Mã định danh suất chiếu (BẮT BUỘC). Lấy từ suất chiếu người dùng vừa chọn trong lịch sử hội thoại."
    )

    seat_type: Optional[SeatType] = Field(
        None, 
        description="Lọc theo loại ghế: STANDARD (Thường), VIP, hoặc COUPLE (Ghế đôi)."
    )

    status: Optional[SeatStatus] = Field(
        SeatStatus.AVAILABLE, 
        description="Lọc theo trạng thái ghế. Mặc định là AVAILABLE để khách chọn ghế trống."
    )
class GetMovieDetailsInput(BaseModel):
    """
    Dùng KHI người dùng đã chỉ định rõ tên một bộ phim cụ thể 
    và muốn hỏi sâu về: nội dung/cốt truyện ('phim này có gì hay?'), 
    dàn diễn viên (cast), đạo diễn (director), thời lượng, hoặc năm sản xuất, ... .
    """

    movie_id: Optional[str] = Field(
        None, 
        description="ID của phim (Lấy từ kết quả tìm kiếm trước đó nếu có)."
    )
    movie_name: Optional[str] = Field(
        None, 
        description="Tên phim khách nhắc đến (Dùng nếu không có movie_id)."
    )
class GetTicketPriceInput(BaseModel):
    """
    Kích hoạt công cụ này khi khách hàng hỏi về giá vé, giá ghế (Standard, VIP, Couple), 
    chi phí xem một bộ phim, hoặc hỏi khoảng giá vé rẻ nhất/cao nhất của một suất chiếu cụ thể .
    """
    showtime_id: Optional[int] = Field(
        None, 
        description="Mã định danh duy nhất (ID) của suất chiếu. CHỈ trích xuất trường này nếu khách hàng đã đề cập cụ thể hoặc đã có sẵn trong lịch sử hội thoại."
    )
    
    movie_name: Optional[str] = Field(
        None, 
        description="Tên hoặc tiêu đề của bộ phim mà khách muốn kiểm tra giá vé (Ví dụ: 'Conan', 'Lọ Lem'). Để trống nếu không được nhắc đến."
    )
    
    theater_name: Optional[str] = Field(
        None, 
        description="Tên hoặc thương hiệu của rạp chiếu phim mà khách muốn xem (Ví dụ: 'DCINE Quận 1', 'Galaxy'). Để trống nếu không được nhắc đến."
    )
    
    audience_type: Optional[AudienceEnum] = Field(
        None, 
        description="Nhóm đối tượng khán giả được nhắc đến cụ thể để tính chiết khấu giảm giá."
    )
class GetSeatMapInput(BaseModel):
    """
    Kích hoạt công cụ này khi khách hàng muốn xem sơ đồ phòng chiếu, danh sách ghế ngồi, 
    tìm ghế trống, hoặc chuẩn bị lựa chọn vị trí ghế để đặt vé cho một suất chiếu cụ thể.
    """
    showtime_id: Optional[int] = Field(
        ..., 
        description="Mã định danh duy nhất (ID) của suất chiếu. BẮT BUỘC phải trích xuất trường này từ ngữ cảnh hội thoại trước khi gọi hàm."
    )