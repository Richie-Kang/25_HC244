package com.aiwebsite_back.api.my.response;

import com.aiwebsite_back.api.my.AIVideo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SharedResponse {
    private String name;       // 비디오 제목
    private String creator;     // 만든 사람
    private String thumbnailUrl; // 썸네일
    private Long id;
    private String url;
    private long likeCount;
    private boolean liked;
    // AIVideo 엔티티에서 직접 변환
    public static SharedResponse fromEntity(AIVideo video, boolean liked) {
        return SharedResponse.builder()
                .name(video.getVideoName())
                .creator(video.getCreator())
                .thumbnailUrl(video.getThumbnailUrl())
                .id(video.getId())
                .url(video.getUrl())
                .likeCount(video.getLikeCount())
                .liked(liked)
                .build();
    }
}