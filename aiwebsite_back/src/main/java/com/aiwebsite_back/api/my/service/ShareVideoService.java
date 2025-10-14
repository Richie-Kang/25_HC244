package com.aiwebsite_back.api.my.service;

import com.aiwebsite_back.api.my.repository.AIVideoRepository;
import com.aiwebsite_back.api.my.repository.LikeVideoRepository;
import com.aiwebsite_back.api.my.response.AIVideoResponse;
import com.aiwebsite_back.api.my.response.SharedResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShareVideoService {

    private final AIVideoRepository aiVideoRepository;
    private final LikeVideoRepository likeVideoRepository;

    /**
     * 공유 상태(share=true)로 설정된 모든 비디오 목록 조회
     * 
     * @return 공유된 비디오 목록
     */
    public List<SharedResponse> getAllSharedVideos(String username) {
        // log.info("공유 상태의 모든 비디오 목록 조회: user={}", username);
        return aiVideoRepository.findAllByShareTrue().stream()
                .map(video -> {
                    boolean liked = likeVideoRepository.existsByVideoAndEmail(video, username);
                    return SharedResponse.fromEntity(video, liked);
                })
                .collect(Collectors.toList());
    }

    public List<SharedResponse> getAllSharedVideosNoLogin() {
        // log.info("공유 상태의 모든 비디오 목록 조회(비로그인)");
        return aiVideoRepository.findAllByShareTrue().stream()
                .map(video -> {
                    return SharedResponse.fromEntity(video, false);
                })
                .collect(Collectors.toList());
    }
}