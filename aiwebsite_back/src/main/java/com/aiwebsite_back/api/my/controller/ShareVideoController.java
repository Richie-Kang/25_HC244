package com.aiwebsite_back.api.my.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.my.response.AIVideoResponse;
import com.aiwebsite_back.api.my.response.SharedResponse;
import com.aiwebsite_back.api.my.service.ShareVideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/videos/shared")
@RequiredArgsConstructor
public class ShareVideoController {

    private final ShareVideoService shareVideoService;

    /**
     * 공유 상태(share=true)인 모든 동영상 목록 조회
     * @return 공유된 동영상 목록
     */
    @GetMapping
    public ResponseEntity<List<SharedResponse>> getSharedVideos(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<SharedResponse> videos = shareVideoService.getAllSharedVideos(userPrincipal.getUsername());
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/no-login")
    public ResponseEntity<List<SharedResponse>> getSharedVideosNoLogin() {
        List<SharedResponse> videos = shareVideoService.getAllSharedVideosNoLogin();
        return ResponseEntity.ok(videos);
    }

}