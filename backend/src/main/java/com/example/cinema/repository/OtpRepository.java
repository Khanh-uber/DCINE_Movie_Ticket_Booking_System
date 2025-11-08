package com.example.cinema.repository;
import com.example.cinema.entity.OtpRecord;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OtpRepository extends JpaRepository<OtpRecord, Long> {

    @Query(value = "SELECT * FROM otp_record where identifier = :identifier order by created_at desc limit 1", nativeQuery = true)
    OtpRecord findLatestIdentifier(@Param("identifier") String identifier);

    @Modifying
    @Query(value = "delete from otp_record where identifier= :identifier ", nativeQuery = true)
    void deleteIdentifier(@Param("identifier") String identifier);

    @Modifying
    @Query(value = "delete from otp_record where expires_at < NOW()", nativeQuery = true)
    void deleteExpiredOtps();  // don dep otp cu;
    
    @Query(value = "SELECT * FROM otp_record WHERE request_id = :requestId LIMIT 1", nativeQuery = true)
    OtpRecord findByRequestId(@Param("requestId") String requestId);

    // Xóa OTP theo requestId (trả về số dòng bị xóa)
    @Modifying
    int deleteByRequestId(String requestId);
}
