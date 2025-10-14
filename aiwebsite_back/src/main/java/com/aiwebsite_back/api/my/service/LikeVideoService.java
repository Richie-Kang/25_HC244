package com.aiwebsite_back.api.my.service;

import com.aiwebsite_back.api.my.AIVideo;
import com.aiwebsite_back.api.my.LikeVideo;
import com.aiwebsite_back.api.my.repository.AIVideoRepository;
import com.aiwebsite_back.api.my.repository.LikeVideoRepository;
import com.aiwebsite_back.api.my.response.AIVideoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikeVideoService {

    private final AIVideoRepository aiVideoRepository;
    private final LikeVideoRepository likeVideoRepository;

    @Transactional
    public AIVideoResponse updateLikeStatus(Long id, boolean like, String email) {
        // log.info("비디오 좋아요 상태 업데이트: ID={}, like={}, email={}", id, like, email);

        // 비디오 찾기
        AIVideo video = aiVideoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "비디오를 찾을 수 없습니다: " + id));

        if (!video.getCreator().equals(email) && !video.isShare()) {
            // log.warn("권한 없는 비디오 좋아요 시도: {}", email);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "해당 비디오에 좋아요 권한이 없습니다");
        }

        boolean hasLiked = likeVideoRepository.existsByVideoAndEmail(video, email);

        if (like && !hasLiked) {
            LikeVideo likeVideo = LikeVideo.builder()
                    .video(video)
                    .email(email)
                    .build();
            likeVideoRepository.save(likeVideo);
            video.setLikeCount(video.getLikeCount() + 1);
        } else if (!like && hasLiked) {
            likeVideoRepository.deleteByVideoAndEmail(video, email);
            long currentLikes = video.getLikeCount();
            video.setLikeCount(Math.max(0, currentLikes - 1));
        }

        AIVideo updatedVideo = aiVideoRepository.save(video);
        // log.info("비디오 좋아요 상태 업데이트 완료: ID={}, 현재 좋아요={}", id,
        // updatedVideo.getLikeCount());

        return AIVideoResponse.fromEntity(updatedVideo);
    }

    @Transactional(readOnly = true)
    public List<AIVideoResponse> getLikedVideos(String email) {
        // log.info("사용자 좋아요 비디오 목록 조회: email={}", email);
        List<LikeVideo> likeVideos = likeVideoRepository.findByEmail(email);

        return likeVideos.stream()
                .map(likeVideo -> AIVideoResponse.fromEntity(likeVideo.getVideo()))
                .collect(Collectors.toList());
    }
}