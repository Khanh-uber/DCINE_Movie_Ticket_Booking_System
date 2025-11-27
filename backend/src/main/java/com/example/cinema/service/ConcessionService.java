package com.example.cinema.service;

import java.util.*;

import org.springframework.stereotype.Service;
import com.example.cinema.entity.*;
import com.example.cinema.dto.ConcessionListResponse;
import com.example.cinema.dto.ConcessionResponse;
import com.example.cinema.repository.ConcessionItemRepository;
import com.example.cinema.repository.ConcessionVariantRepository;
import com.example.cinema.repository.ShowTimeRepository;

@Service
public class ConcessionService {
    private final ShowTimeRepository showtimeRepo;
    private final ConcessionItemRepository itemRepo;
    private final ConcessionVariantRepository variantRepo;
    public ConcessionService(ShowTimeRepository showtimeRepo, ConcessionItemRepository itemRepo, ConcessionVariantRepository variantRepo){
        this.showtimeRepo = showtimeRepo;
        this.itemRepo = itemRepo;
        this.variantRepo = variantRepo;
    }

    public ConcessionListResponse getAll() {
        List<ConcessionItem> items = itemRepo.findByActive();
        return mapToResponse(items);
    }

    public ConcessionListResponse getByCategory(String category) {
        List<ConcessionItem> items = itemRepo.findByCategoryAndActive(category, true);
        return mapToResponse(items);
    }

    private ConcessionListResponse mapToResponse(List<ConcessionItem> items) {
        List<ConcessionListResponse.Item> dtoList = new ArrayList<>();

        for (ConcessionItem item : items) {
            ConcessionListResponse.Item dto = new ConcessionListResponse.Item();

            dto.setId(item.getItemId());
            dto.setCode(item.getCode());
            dto.setTitle(item.getTitle());
            dto.setDescription(item.getDescription());
            dto.setPrice(item.getPrice());
            dto.setOldPrice(item.getOldPrice());
            dto.setTag(item.getTag());
            dto.setImageUrl(item.getImageUrl());
            dto.setCategory(item.getCategory());

            List<ConcessionVariant> variants = variantRepo.findByItemId(item.getItemId());
            List<ConcessionListResponse.Variant> varList = new ArrayList<>();

            for (ConcessionVariant v : variants){
                ConcessionListResponse.Variant vdto = new ConcessionListResponse.Variant();
                vdto.setId(v.getVariantId());
                vdto.setLabel(v.getLabel());
                vdto.setValue(v.getValue());
                vdto.setPriceDiff(v.getPriceDiff());
                varList.add(vdto);
            }

            dto.setVariants(varList);
            dtoList.add(dto);
        }

        return new ConcessionListResponse(dtoList);
    }
}
