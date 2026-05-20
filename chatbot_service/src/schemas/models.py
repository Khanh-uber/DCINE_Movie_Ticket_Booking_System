from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime, date 
from schemas.tool_input import ShowingStatus
class Movie(BaseModel):
    """Hình dáng dữ liệu của bảng Movie """
    movie_id: str = Field(..., description="Mã định danh duy nhất của phim (PK)")
    title: str = Field(..., description="Tên chính thức của bộ phim")
    genres: list[str] = Field(default_factory=list, description="Danh sách các thể loại phim (Vd: Hành động, Hài)")
    age_rating: str = Field(..., description="Nhãn phân loại độ tuổi (P, T13, T16, T18)")
    duration_mins: int = Field(..., description="Thời lượng phim tính bằng phút")
    release_date: date  = Field(..., description="Ngày khởi chiếu chính thức (YYYY-MM-DD)")
    status: ShowingStatus = Field(..., description="Trạng thái hiện tại của phim trong hệ thống")
    synopsis: Optional[str] = Field(None, description="Tóm tắt ngắn gọn nội dung phim")
    poster_url : Optional[str] = Field(None, description="poster ảnh phim")

class Hall(BaseModel):
    """Thông tin phòng chiếu thuộc một rạp"""
    hall_id: str = Field(..., description="Mã định danh phòng chiếu (PK)")
    theater_id: str = Field(..., description="ID của rạp chứa phòng này (FK)")
    hall_name: str = Field(..., description="Tên phòng (Vd: Phòng 01, IMAX, Gold Class)")



class Theater(BaseModel):
    """Hinh dang du lieu cua bang Cinema"""
    theater_id : str = Field(..., description="Mẫ định danh của rạp phim (PK)")
    theater_name : str = Field(..., description= "Tên rạp phim")
    theater_address : str = Field(..., description= "Địa chỉ của rạp phim ")

    location_id: str = Field(..., description="Mã định danh khu vực (FK liên kết với bảng Location)")


class Showtime(BaseModel):
    "Hình dáng dữ liệu của bảng Showtime"
    showtime_id : str = Field(..., description="mã định danh suất chiếu")

    movie_id: str = Field(..., description="ID của bộ phim (FK)") 
    hall_id: str = Field(..., description="ID của phòng phim (FK)")

    start_at : datetime = Field(..., description="Thời gian bắt đầu chiếu phim ")
    end_at : datetime  = Field(..., description= "Thời gian kết thúc bộ phim")
    base_price: int = Field(..., description="Giá tiền suất chiếu") 
    is_early_screening: Optional[bool] = False

class Location(BaseModel):
    location_id: str = Field(..., description="Mã định danh khu vực (PK)")
    location_name: str = Field(..., description="Tên khu vực (Vd: Quận 1, Bình Thạnh, Thủ Đức)")

    province_id : str = Field(..., description = "ID định danh Tỉnh của khu vực")

class Province(BaseModel):
    province_id : str = Field(..., description = "Mã định danh của Tỉnh (PK)")
    province_name : str = Field(..., description="Tên tỉnh")
    

    
