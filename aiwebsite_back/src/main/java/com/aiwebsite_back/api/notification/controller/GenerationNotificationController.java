package com.aiwebsite_back.api.notification.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.notification.request.NotificationCreateRequest;
import com.aiwebsite_back.api.notification.request.NotificationUpdateRequest;
import com.aiwebsite_back.api.notification.response.NotificationResponse;
import com.aiwebsite_back.api.notification.service.GenerationNotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 알림 생성·조회·업데이트 컨트롤러
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class GenerationNotificationController {

    private final GenerationNotificationService service;

    /** application.yml 에서 정의한 내부 API 토큰 */
    @Value("${internal.api-token}")
    private String internalApiToken;

    /**
     * 1) 알림 생성
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> create(
            @Valid @RequestBody NotificationCreateRequest req,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.ok(service.create(user, req));
    }

    /**
     * 2) 내부 시스템용 업데이트
     *    X-API-TOKEN 헤더가 있는 요청에만 매핑됩니다.
     */
    @PutMapping(path = "/{id}", headers = "X-API-TOKEN")
    public ResponseEntity<NotificationResponse> updateInternal(
            @PathVariable Long id,
            @RequestHeader("X-API-TOKEN") String apiToken,
            @Valid @RequestBody NotificationUpdateRequest req
    ) {
        if (!internalApiToken.equals(apiToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // 서비스 레이어에서 user 없이 ID 기반 업데이트
        return ResponseEntity.ok(service.updateWithUserId(id, req));
    }

    /**
     * 3) 클라이언트(로그인 사용자)용 업데이트
     */
    @PutMapping(path = "/{id}")
    public ResponseEntity<NotificationResponse> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody NotificationUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.ok(service.update(user, id, req));
    }

    /**
     * 4) 내 알림 목록 조회
     */
    @GetMapping
    public ResponseEntity<NotificationResponse.ListResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal user
    ) {
        return ResponseEntity.ok(
                service.list(user, PageRequest.of(page, size))
        );
    }
}
