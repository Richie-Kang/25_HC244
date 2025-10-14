package com.aiwebsite_back.api.notification;

import com.aiwebsite_back.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@Table(name = "generation_notifications")
public class GenerationNotification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 예: “골프장에서 매력 뽐내기” */
    @Column(nullable = false)
    private String title;

    /** 대표 썸네일 URL (없으면 빈 문자열) */
    @Column(nullable = false, length = 1000)
    private String thumbnailUrl;

    /** 이미지·영상 개수 */
    private int mediaCount;

    /** 상태 */
    @Enumerated(EnumType.STRING)
    private Status status;          // REQUESTED, PROCESSING, COMPLETED, FAILED

    /** 생성/업데이트 시각 */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** 소유 사용자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private Long videoId; // 생성된 영상 ID (선택적, 생성 후에만 사용)

    /* ---------------------------------------------------- */
    public enum Status { REQUESTED, PROCESSING, COMPLETED, FAILED }
}
