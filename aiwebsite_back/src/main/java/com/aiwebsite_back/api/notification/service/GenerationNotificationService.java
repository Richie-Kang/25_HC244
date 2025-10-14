package com.aiwebsite_back.api.notification.service;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.notification.GenerationNotification;
import com.aiwebsite_back.api.notification.repository.GenerationNotificationRepository;
import com.aiwebsite_back.api.notification.request.*;
import com.aiwebsite_back.api.notification.response.NotificationResponse;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GenerationNotificationService {

    private final GenerationNotificationRepository repo;
    private final UserRepository userRepository;

    /* 1) 생성 */
    @Transactional
    public NotificationResponse create(UserPrincipal user,
                                       NotificationCreateRequest req) {

        GenerationNotification n = GenerationNotification.builder()
                .title(req.getTitle())
                .thumbnailUrl(req.getThumbnailUrl())
                .mediaCount(req.getMediaCount())
                .status(GenerationNotification.Status.REQUESTED)
                .updatedAt(LocalDateTime.now())
                .user(user.getUser())
                .build();

        return NotificationResponse.fromEntity(repo.save(n));
    }

    public NotificationResponse updateWithUserId(Long id, NotificationUpdateRequest req) {
        // userId로 사용자 조회
        User user = userRepository.findById(Long.parseLong(req.getUserId()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "사용자 ID " + req.getUserId() + "를 찾을 수 없습니다"));

        // 기존 로직을 활용하여 업데이트 수행
        return update(new UserPrincipal(user), id, req);
    }

    /* 2) 상태 변경 */
    @Transactional
    public NotificationResponse update(UserPrincipal user,
                                       Long id,
                                       NotificationUpdateRequest req) {

        GenerationNotification n = repo.findByUserIdAndId(user.getUser().getId(), id)
                .orElseThrow(() -> new IllegalArgumentException("알림 없음 id=" + id));

        n.setStatus(req.getStatus());
        if (req.getThumbnailUrl() != null) n.setThumbnailUrl(req.getThumbnailUrl());
        if (req.getMediaCount() != null) n.setMediaCount(req.getMediaCount());
        if (req.getVideoId() != null) n.setVideoId(req.getVideoId());  // videoId 설정 추가
        n.setUpdatedAt(LocalDateTime.now());

        return NotificationResponse.fromEntity(repo.save(n));
    }

    /* 3) 목록 */
    @Transactional(readOnly = true)
    public NotificationResponse.ListResponse list(UserPrincipal user,
                                                  Pageable pageable) {

        Page<GenerationNotification> page =
                repo.findAllByUserIdOrderByUpdatedAtDesc(user.getUser().getId(), pageable);

        return NotificationResponse.ListResponse.builder()
                .notifications(page.getContent().stream()
                        .map(NotificationResponse::fromEntity)
                        .toList())
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
