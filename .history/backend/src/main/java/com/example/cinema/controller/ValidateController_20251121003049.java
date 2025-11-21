package com.example.cinema.controller;

import com.example.cinema.service.ValidateConflictService;

@PostMapping("/booking/validate-seats")
public class ValidateController {
    private final ValidateConflictService validateConflictService;
    public ValidateController(ValidateConflictService validateConflictService)
}