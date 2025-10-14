package com.aiwebsite_back.api.notification.repository;

import com.aiwebsite_back.api.notification.GenerationNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GenerationNotificationRepository
        extends JpaRepository<GenerationNotification, Long> {

    Page<GenerationNotification> findAllByUserIdOrderByUpdatedAtDesc(
            Long userId, Pageable pageable);

    Optional<GenerationNotification> findByUserIdAndId(
            Long userId, Long id);
}
