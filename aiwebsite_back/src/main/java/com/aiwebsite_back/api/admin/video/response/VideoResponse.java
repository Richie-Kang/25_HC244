package com.aiwebsite_back.api.admin.video.response;

import com.aiwebsite_back.api.admin.video.Video;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponse {
    private Long id;
    private String name;
    private String prompt;
    private String url;
    private String thumbnailUrl;
    private String format;
    private Long sizeInBytes;
    private LocalDateTime createdAt;
    private Video.VideoType mode;
    private String referenceFile; // Add this field
    private boolean share;
    private String model;
    private String creator;
    private long likeCount;     // Like count
    private long clickCount;    // Click count


    public static VideoResponse fromEntity(Video video) {
        return VideoResponse.builder()
                .id(video.getId())
                .name(video.getName())
                .prompt(video.getPrompt())
                .url(video.getUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .format(video.getFormat())
                .sizeInBytes(video.getSizeInBytes())
                .createdAt(video.getCreatedAt())
                .mode(video.getMode())
                .referenceFile(video.getReferenceFile()) // Map the modeFile
                .share(video.isShare())
                .creator(video.getCreator())
                .model(video.getModel())
                .clickCount(video.getClickCount())
                .likeCount(video.getLikeCount())
                .build();
    }
}