package com.aiwebsite_back.api.my.response;

import com.aiwebsite_back.api.my.AIVideo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIVideoResponse {
    private Long id;
    private String name;
    private String prompt;
    private String url;
    private String model;
    private AIVideo.VideoType mode;
    private String referenceFile;
    private boolean share;
    private String creator;
    private String thumbnailUrl;
    private Integer durationInSeconds;
    private LocalDateTime createdAt;
    private long likeCount;     // Like count
    private long clickCount;    // Click count
    private boolean liked;      // Whether current user has liked this video

    public static AIVideoResponse fromEntity(AIVideo video) {
        return AIVideoResponse.builder()
                .id(video.getId())
                .name(video.getVideoName())
                .prompt(video.getPrompt())
                .url(video.getUrl())
                .model(video.getModel())
                .mode(video.getMode())
                .referenceFile(video.getReferenceFile())
                .share(video.isShare())
                .creator(video.getCreator())
                .thumbnailUrl(video.getThumbnailUrl())
                .durationInSeconds(video.getDurationInSeconds())
                .createdAt(video.getCreatedAt())
                .clickCount(video.getClickCount())
                .likeCount(video.getLikeCount())
                .liked(false) // Default value
                .build();
    }

    // Overloaded method with user like information
    public static AIVideoResponse fromEntity(AIVideo video, boolean liked) {
        AIVideoResponse response = fromEntity(video);
        response.liked = liked;
        return response;
    }
}