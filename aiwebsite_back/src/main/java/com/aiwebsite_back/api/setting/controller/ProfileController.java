package com.aiwebsite_back.api.setting.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.setting.request.ProfileRequest;
import com.aiwebsite_back.api.setting.response.ProfileResponse;
import com.aiwebsite_back.api.setting.service.ProfileService;
import com.aiwebsite_back.api.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final JwtUtil jwtUtil;

    @PutMapping("/nickname-with-videos")
    public ResponseEntity<ProfileResponse> updateNickname(
            @RequestBody ProfileRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        // Extract user ID from token
        Long userId = userPrincipal.getUser().getId();

        // Call service to update nickname
        ProfileResponse response = profileService.updateNickname(userId, request.getNickname());

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}