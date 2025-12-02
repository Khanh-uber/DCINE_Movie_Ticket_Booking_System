package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.PromotionResponse;
import com.example.cinema.repository.PromotionRepository;
import com.example.cinema.repository.MembershipProjection;
import java.util.*;
import com.example.cinema.entity.*;;
@Service
public class PromotionService {
    private final PromotionRepository promotionRepository;
    public PromotionService(PromotionRepository promotionRepository){
        this.promotionRepository = promotionRepository;
    }

    public List<PromotionResponse> getActivePromotions(){
        List<Voucher> vouchers = promotionRepository.findVoucherByActive();
        List<PromotionResponse> plist = new ArrayList<>();

        for (Voucher v : vouchers){
            PromotionResponse dto = new PromotionResponse();
            dto.setId(v.getVoucherId());
            dto.setCode(v.getCode());
            dto.setName(null);             
            dto.setDescription(null);      

            dto.setDiscountType(v.getType()); 
            dto.setDiscountValue(v.getValue());   
            dto.setMinOrder(v.getMinOrder());
            dto.setMaxDiscount(null);
            String appliesTo = "Tất cả khách hàng";
            if (v.getMembershipTierId() != null) {
                List<MembershipProjection> membershipList = promotionRepository.getMembershipTier(v.getMembershipTierId());
                if (!membershipList.isEmpty()) {
                    MembershipProjection membership = membershipList.get(0);
                    if (membership.getName() != null) {
                        appliesTo = membership.getName();
                    } else {
                        appliesTo = "Thành viên";
                    }
                } else {
                    appliesTo = "Thành viên";
                } 
            }
            dto.setAppliesTo(appliesTo);
            dto.setValidFrom(v.getStartAt());
            dto.setValidTo(v.getEndAt());
            dto.setActive(true);
            Double discountAmount = 0.0;
            if (v.getType() == "PERCENT")
                discountAmount = v.getValue();
            else
                discountAmount = v.getValue();
            dto.setDiscountAmount(discountAmount.longValue());
            plist.add(dto);
        }
        return plist;
    }

}
