/* 상태 업데이트 */
package com.aiwebsite_back.api.notification.request;

import com.aiwebsite_back.api.notification.GenerationNotification;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationUpdateRequest {

    @NotNull(message = "status 는 필수입니다.")
    private GenerationNotification.Status status;
    private String userId;
    private String thumbnailUrl;   // 바뀌면 전달
    private Integer mediaCount;    // 바뀌면 전달
    private Long videoId; // 생성된 영상 ID (선택적, 생성 후에만 사용)
}
