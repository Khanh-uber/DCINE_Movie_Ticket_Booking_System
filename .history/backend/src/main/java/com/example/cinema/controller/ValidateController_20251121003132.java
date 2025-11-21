package com.example.cinema.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.cinema.service.ValidateConflictService;

@RestController
@RequestMapping
public class ValidateController {
    private final ValidateConflictService validateConflictService;
    public ValidateController(ValidateConflictService validateConflictService){
        this.validateConflictService = validateConflictService;
    }

    @PostMapping("/booking/validate-seats")
}