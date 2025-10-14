package com.aiwebsite_back.api.my.controller;

import com.aiwebsite_back.api.my.request.FolderRequest;
import com.aiwebsite_back.api.my.response.FolderResponse;
import com.aiwebsite_back.api.my.service.FolderService;
import com.aiwebsite_back.api.config.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    // 폴더 생성
    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody FolderRequest folderRequest
    ) {
        FolderResponse response = folderService.createFolder(folderRequest, userPrincipal);
        return ResponseEntity.ok(response);
    }

    // 사용자 폴더 목록 조회
    @GetMapping
    public ResponseEntity<List<FolderResponse>> getFolders(
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        List<FolderResponse> folders = folderService.getFoldersByUser(userPrincipal);
        return ResponseEntity.ok(folders);
    }

    // 폴더 삭제
    @DeleteMapping("/{folderId}")
    public ResponseEntity<Void> deleteFolder(
            @PathVariable Long folderId,
            @AuthenticationPrincipal UserPrincipal userPrincipal
    ) {
        folderService.deleteFolder(folderId, userPrincipal);
        return ResponseEntity.noContent().build();
    }
}
