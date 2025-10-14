package com.aiwebsite_back.api.my.request;

import com.aiwebsite_back.api.my.AIVideo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AIVideoRequest {
    private String videoName;
    private String prompt;
    private String model;
    private AIVideo.VideoType mode;
    private String videoUrl;
    private String referenceUrl;
    private String userId;
}
