package com.aiwebsite_back.api.my.repository;

import com.aiwebsite_back.api.my.AIVideo;
import com.aiwebsite_back.api.my.LikeVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeVideoRepository extends JpaRepository<LikeVideo, Long> {
    Optional<LikeVideo> findByVideoAndEmail(AIVideo video, String email);
    boolean existsByVideoAndEmail(AIVideo video, String email);
    List<LikeVideo> findByEmail(String email);
    void deleteByVideoAndEmail(AIVideo video, String email);
}