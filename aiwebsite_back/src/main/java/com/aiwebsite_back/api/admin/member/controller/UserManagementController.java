package com.aiwebsite_back.api.admin.member.controller;

import com.aiwebsite_back.api.admin.member.request.UserManagementRequest;
import com.aiwebsite_back.api.admin.member.response.UserManagementResponse;
import com.aiwebsite_back.api.admin.member.service.UserManagementService;
import com.aiwebsite_back.api.config.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserManagementController {
    private final UserManagementService userManagementService;

    @GetMapping
    public ResponseEntity<UserManagementResponse> getUserList(UserManagementRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        UserManagementResponse response = userManagementService.getUserList(request, user);
        return ResponseEntity.ok(response);
    }
}