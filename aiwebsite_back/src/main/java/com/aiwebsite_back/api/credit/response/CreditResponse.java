package com.aiwebsite_back.api.credit.response;

import lombok.Builder;
import lombok.Getter;

@Getter
public class CreditResponse {
    private final Long currentCredit;

    @Builder
    public CreditResponse(Long currentCredit) {
        this.currentCredit = currentCredit;
    }
} 