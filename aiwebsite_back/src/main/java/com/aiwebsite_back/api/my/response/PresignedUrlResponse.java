package com.aiwebsite_back.api.my.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlResponse {
    private String presignedUrl;
    private String s3Key;
    private String finalUrl;
    private long expirationSeconds;
}