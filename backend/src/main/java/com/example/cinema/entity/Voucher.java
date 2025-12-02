package com.example.cinema.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voucher")
public class Voucher{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_id")
    private Long voucherId;

    @Column(name = "membership_tier_id")
    private Long membershipTierId;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double value;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Column(name = "min_order")
    private Double minOrder;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    private Integer usedCount;

    public Voucher(){}

    public Voucher(Long voucherId, Long membershipTierId, String code, String type, Double value, LocalDateTime startAt, LocalDateTime endAt, Double minOrder, Integer usageLimit, Integer usedCount){
        this.voucherId = voucherId;
        this.membershipTierId = membershipTierId;
        this.code = code;
        this.type = type;
        this.value = value;
        this.startAt = startAt;
        this.endAt = endAt;
        this.minOrder = minOrder;
        this.usageLimit = usageLimit;
        this.usedCount = usedCount;
    }
    public Long getVoucherId(){
        return voucherId;
    }
    public void setVoucherId(Long voucherId){
        this.voucherId = voucherId;
    }
    public Long getMembershipTierId(){
        return membershipTierId;
    }
    public void setMembershipTierId(Long membershipTierId){
        this.membershipTierId = membershipTierId;
    }
    public String getCode(){
        return code;
    }
    public void setCode(String code){
        this.code = code;
    }
    public String getType(){
        return type;
    }
    public void setType(String type){
        this.type = type;
    }
    public Double getValue(){
        return value;
    }
    public void setValue(Double value){
        this.value = value;
    }
    public LocalDateTime getStartAt(){
        return startAt;
    }
    public void setStartAt(LocalDateTime startAt){
        this.startAt = startAt;
    }
    public LocalDateTime getEndAt(){
        return endAt;
    }
    public void setEndAt(LocalDateTime endAt){
        this.endAt = endAt;
    }
    public Double getMinOrder(){
        return minOrder;
    }
    public void setMinOrder(Double minOrder){
        this.minOrder = minOrder;
    }
    public Integer getUsageLimit(){
        return usageLimit;
    }
    public void setUsageLimit(Integer usageLimit){
        this.usageLimit = usageLimit;
    }
    public Integer getUsedCount(){
        return usedCount;
    }
    public void setUsedCount(Integer usedCount){
        this.usedCount = usedCount;
    }
}
