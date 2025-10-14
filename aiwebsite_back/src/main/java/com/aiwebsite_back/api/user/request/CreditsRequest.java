package com.aiwebsite_back.api.user.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditsRequest {
    private Long amount;
    private String operation; // "ADD" 또는 "SUBTRACT"
}