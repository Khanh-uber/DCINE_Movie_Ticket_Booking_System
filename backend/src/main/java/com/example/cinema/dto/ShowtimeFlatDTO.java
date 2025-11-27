package com.example.cinema.dto;

import java.math.BigDecimal;
import java.util.Date;
import java.util.Map;

public class ShowtimeFlatDTO {

    private Long id;
    private Long movieId;
    private String movieTitle;
    private String posterUrl;
    private String bannerUrl;

    private Long theaterId;
    private String theaterName;

    private Long provinceId;
    private String provinceName;

    private Long hallId;
    private String hallName;

    private Date startAt;
    private Date endAt;

    private String format;
    private BigDecimal basePrice;

    public ShowtimeFlatDTO() {}

    public static ShowtimeFlatDTO fromMap(Map<String, Object> map) {
        ShowtimeFlatDTO dto = new ShowtimeFlatDTO();

        dto.setId(getLong(map.get("id")));
        dto.setMovieId(getLong(map.get("movieId")));
        dto.setMovieTitle((String) map.get("movieTitle"));
        dto.setPosterUrl((String) map.get("posterUrl"));
        dto.setBannerUrl((String) map.get("bannerUrl"));

        dto.setTheaterId(getLong(map.get("theaterId")));
        dto.setTheaterName((String) map.get("theaterName"));

        dto.setProvinceId(getLong(map.get("provinceId")));
        dto.setProvinceName((String) map.get("provinceName"));

        dto.setHallId(getLong(map.get("hallId")));
        dto.setHallName((String) map.get("hallName"));

        dto.setStartAt((Date) map.get("startAt"));
        dto.setEndAt((Date) map.get("endAt"));

        dto.setFormat((String) map.get("format"));

        Object priceObj = map.get("basePrice");
        if (priceObj instanceof BigDecimal) {
            dto.setBasePrice((BigDecimal) priceObj);
        } else if (priceObj instanceof Number) {
            dto.setBasePrice(BigDecimal.valueOf(((Number) priceObj).doubleValue()));
        }

        return dto;
    }

    private static Long getLong(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Integer) return ((Integer) obj).longValue();
        if (obj instanceof Long) return (Long) obj;
        return Long.valueOf(obj.toString());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }

    public String getMovieTitle() { return movieTitle; }
    public void setMovieTitle(String movieTitle) { this.movieTitle = movieTitle; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public Long getTheaterId() { return theaterId; }
    public void setTheaterId(Long theaterId) { this.theaterId = theaterId; }

    public String getTheaterName() { return theaterName; }
    public void setTheaterName(String theaterName) { this.theaterName = theaterName; }

    public Long getProvinceId() { return provinceId; }
    public void setProvinceId(Long provinceId) { this.provinceId = provinceId; }

    public String getProvinceName() { return provinceName; }
    public void setProvinceName(String provinceName) { this.provinceName = provinceName; }

    public Long getHallId() { return hallId; }
    public void setHallId(Long hallId) { this.hallId = hallId; }

    public String getHallName() { return hallName; }
    public void setHallName(String hallName) { this.hallName = hallName; }

    public Date getStartAt() { return startAt; }
    public void setStartAt(Date startAt) { this.startAt = startAt; }

    public Date getEndAt() { return endAt; }
    public void setEndAt(Date endAt) { this.endAt = endAt; }

    public String getFormat() { return format; }
    public void setFormat(String format) { this.format = format; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
}
