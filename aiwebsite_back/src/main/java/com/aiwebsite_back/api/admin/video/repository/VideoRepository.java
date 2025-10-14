package com.aiwebsite_back.api.admin.video.repository;

import com.aiwebsite_back.api.admin.video.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
}