/* 요청 생성 */
package com.aiwebsite_back.api.notification.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationCreateRequest {

    @NotBlank(message = "title 은 필수입니다.")
    private String title;

    /** 초기 썸네일(선택), 없으면 빈 문자열 전송 */
    private String thumbnailUrl = "";

    /** 예상 이미지·영상 개수(선택) */
    private Integer mediaCount = 0;
}
