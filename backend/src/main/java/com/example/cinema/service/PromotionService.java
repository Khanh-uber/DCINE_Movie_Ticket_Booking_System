package com.example.cinema.service;

import org.springframework.stereotype.Service;

import com.example.cinema.dto.PromotionResponse;
import com.example.cinema.repository.PromotionRepository;
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
            dto.setName(null);             // để FE tự build title từ code
            dto.setDescription(null);      // FE tự build desc "Giảm X%..."

            dto.setDiscountType(v.getType());        // PERCENT / AMOUNT
            dto.setDiscountValue(v.getValue());      // 10 / 20000
            dto.setMinOrder(v.getMinOrder());
            dto.setMaxDiscount(null);

            // --- map membership tier name ---
            String appliesTo = "Tất cả khách hàng";
            if (v.getMembershipTierId() != null) {
                List<Map<String, Object>> membershipList =
                        promotionRepository.getMembershipTier(v.getMembershipTierId());
                if (!membershipList.isEmpty()) {
                    Map<String, Object> membership = membershipList.get(0);
                    Object name = membership.get("name");
                    if (name != null) {
                        appliesTo = (String) name;
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

            plist.add(dto);
        }
        return plist;
    }

}
