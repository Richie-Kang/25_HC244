package com.aiwebsite_back.api.credit.request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreditConsumeRequest {
    private int amount;
    private String reason;
} 