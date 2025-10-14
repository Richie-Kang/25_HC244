package com.aiwebsite_back.api.admin.video.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoRequest {
    private String name;
    private String prompt;
    private String model;
}