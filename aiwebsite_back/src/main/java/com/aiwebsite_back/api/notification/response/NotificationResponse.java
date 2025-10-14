/* 응답 */
package com.aiwebsite_back.api.notification.response;

import com.aiwebsite_back.api.notification.GenerationNotification;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse {

    private Long id;
    private String title;
    private String thumbnailUrl;
    private int mediaCount;
    private GenerationNotification.Status status;
    private LocalDateTime updatedAt;
    private Long videoId; // 생성된 영상 ID (선택적, 생성 후에만 사용)

    /* -------- 리스트 -------- */
    @Getter @Setter @Builder
    public static class ListResponse {
        private List<NotificationResponse> notifications;
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private boolean hasNext;
        private boolean hasPrevious;
        private Long videoId; // 생성된 영상 ID (선택적, 생성 후에만 사용)
    }

    /* -------- 매핑 -------- */
    public static NotificationResponse fromEntity(GenerationNotification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .thumbnailUrl(n.getThumbnailUrl())
                .mediaCount(n.getMediaCount())
                .status(n.getStatus())
                .updatedAt(n.getUpdatedAt())
                .videoId(n.getVideoId())  // videoId 매핑 추가
                .build();
    }
}
