package com.aiwebsite_back.api.credit.response;

import com.aiwebsite_back.api.credit.CreditTransaction;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class CreditTransactionResponse {
    private final Long id;
    private final int amount;
    private final String reason;
    private final LocalDateTime createdAt;

    @Builder
    public CreditTransactionResponse(Long id, int amount, String reason, LocalDateTime createdAt) {
        this.id = id;
        this.amount = amount;
        this.createdAt = createdAt;
        this.reason = reason;
    }

    public static CreditTransactionResponse from(CreditTransaction transaction) {
        return CreditTransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .reason(transaction.getReason())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
} 