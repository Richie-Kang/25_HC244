package com.aiwebsite_back.api.my.response;

import com.aiwebsite_back.api.my.AIVideo;

import java.time.LocalDateTime;

public class SharedNoLoginResponse {
    private Long id;
    private String name;
    private String url;
    private String model;
    private AIVideo.VideoType mode;
    private String creator;
    private String thumbnailUrl;
    private long likeCount;     // Like count
    private long clickCount;    // Click count
    private boolean liked;
}
