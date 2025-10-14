package com.aiwebsite_back.api.my.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.my.response.AIVideoResponse;
import com.aiwebsite_back.api.my.service.LikeVideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/videos/like")
@RequiredArgsConstructor
@Slf4j
public class LikeVideoController {

    private final LikeVideoService likeVideoService;

    @PatchMapping("/{id}")
    public ResponseEntity<AIVideoResponse> updateLikeStatus(
            @PathVariable Long id,
            @RequestParam boolean like,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(likeVideoService.updateLikeStatus(id, like, userPrincipal.getUsername()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AIVideoResponse>> getLikedVideos(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(likeVideoService.getLikedVideos(userPrincipal.getUsername()));
    }
}