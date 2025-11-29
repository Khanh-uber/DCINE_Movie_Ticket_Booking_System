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

    public List<PromotionResponse> getActivePromotion(){
        List<Voucher> vouchers = promotionRepository.findVoucherByActive();
        
        List<PromotionResponse> plist = new ArrayList<>();
        for (Voucher v : vouchers){
            
        }
    }
}
