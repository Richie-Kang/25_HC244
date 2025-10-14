package com.aiwebsite_back.api.user.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditsResponse {
    private Long userId;
    private String email;
    private Long credits;
    private String message;
}