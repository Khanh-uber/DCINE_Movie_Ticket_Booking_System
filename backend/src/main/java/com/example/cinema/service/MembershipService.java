package com.example.cinema.service;

import com.example.cinema.dto.MembershipDTO;
import com.example.cinema.entity.Membership;
import com.example.cinema.repository.MembershipRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MembershipService {

    private final MembershipRepository membershipRepository;

    public MembershipService(MembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    public List<MembershipDTO> getAllMemberships() {
        List<Membership> entities = membershipRepository.findAll();
        return entities.stream().map(m -> {
            MembershipDTO dto = new MembershipDTO();
            dto.setId(m.getTierId());          
            dto.setName(m.getName());
            dto.setDescription(m.getDescription());
            dto.setMinSpent(m.getMinSpending()); 
            dto.setPointRate(
                m.getPointMultiplier() != null ? m.getPointMultiplier() : 0.0
            );
            return dto;
        }).collect(Collectors.toList());
    }
}