package com.aiwebsite_back.api.my.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.my.AIVideo;
import com.aiwebsite_back.api.my.request.AIVideoRequest;
import com.aiwebsite_back.api.my.request.VideoRenameRequest;
import com.aiwebsite_back.api.my.response.AIVideoResponse;
import com.aiwebsite_back.api.my.service.AIVideoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MimeTypeUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/my/videos")
@RequiredArgsConstructor
public class AIVideoController {

    private final AIVideoService aiVideoService;
    @Value("${internal.api-token}")
    private String internalApiToken;

    /*
     * =====================================================================
     * 1. [멀티파트] 로컬 영상 업로드 (videoFile 필수)
     * =====================================================================
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
    public ResponseEntity<AIVideoResponse> uploadVideoMultipart(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestPart("videoFile") MultipartFile videoFile,
            @RequestPart(value = "referenceFile", required = false) MultipartFile referenceFile,
            @RequestPart("data") @Valid AIVideoRequest request) {

        try {
            AIVideoResponse resp = aiVideoService.saveVideo(
                    request, videoFile, referenceFile, user);

            return ResponseEntity.status(HttpStatus.CREATED).body(resp);

        } catch (IOException e) {
            log.error("영상 저장 중 I/O 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /*
     * =====================================================================
     * 2. [멀티파트+URL] 외부 URL 영상 업로드 (videoUrl 필드 필수)
     * =====================================================================
     */
    @PostMapping(value = "/url", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE,
            MediaType.APPLICATION_JSON_VALUE }, produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
    public ResponseEntity<AIVideoResponse> uploadVideoFromUrl(
            @RequestHeader("X-API-TOKEN") String apiToken,
            @RequestPart("data") @Valid AIVideoRequest request) {

        // API 토큰 검증
        if (!internalApiToken.equals(apiToken)) {
            log.warn("유효하지 않은 API 토큰: {}", apiToken);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!StringUtils.hasText(request.getVideoUrl())) {
            return ResponseEntity.badRequest().build();
        }
// userId 확인
        if (!StringUtils.hasText(request.getUserId())) {
            log.warn("userId가 제공되지 않았습니다");
            return ResponseEntity.badRequest().build();
        }
        try {
            // 시스템 사용자로 처리 (user 대신 null 또는 기본값 전달)
            AIVideoResponse resp = aiVideoService.saveVideoWithReferences(
                    request, null, null, null);

            return ResponseEntity.status(HttpStatus.CREATED).body(resp);

        } catch (IOException e) {
            log.error("URL 영상 저장 중 I/O 오류", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /*
     * =====================================================================
     * 3. 사용자 보유 영상 조회
     * =====================================================================
     */
    @GetMapping("/user")
    public ResponseEntity<List<AIVideoResponse>> getUserVideos(
            @AuthenticationPrincipal UserPrincipal user) {

        List<AIVideoResponse> list = aiVideoService.getUserVideos(user.getNickname());
        return ResponseEntity.ok(list);
    }

    /*
     * =====================================================================
     * 4. 단일 영상 상세 조회
     * =====================================================================
     */
    @GetMapping("/{id}")
    public ResponseEntity<AIVideoResponse> getVideoById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal user) {

        AIVideoResponse resp = aiVideoService.getVideoById(id, user.getNickname());
        return ResponseEntity.ok(resp);
    }

    /*
     * =====================================================================
     * 5. 공유 상태 토글
     * =====================================================================
     */
    @PatchMapping("/{id}/share")
    public ResponseEntity<AIVideoResponse> updateShareStatus(
            @PathVariable Long id,
            @RequestParam boolean share,
            @AuthenticationPrincipal UserPrincipal user) {

        AIVideoResponse resp = aiVideoService.updateShareStatus(id, share, user.getNickname());
        return ResponseEntity.ok(resp);
    }

    /*
     * =====================================================================
     * 6. 타입별 조회 (TEXT / IMAGE / etc.)
     * =====================================================================
     */
    @GetMapping("/type/{videoType}")
    public ResponseEntity<List<AIVideoResponse>> getUserVideosByType(
            @PathVariable AIVideo.VideoType videoType,
            @AuthenticationPrincipal UserPrincipal user) {

        List<AIVideoResponse> list = aiVideoService.getUserVideosByType(
                user.getNickname(), videoType);
        return ResponseEntity.ok(list);
    }

    /*
     * =====================================================================
     * 7. 비디오 이름 변경
     * =====================================================================
     */
    @PatchMapping("/{id}/rename")
    public ResponseEntity<AIVideoResponse> renameVideo(
            @PathVariable Long id,
            @RequestBody VideoRenameRequest request,
            @AuthenticationPrincipal UserPrincipal user) {

        AIVideoResponse resp = aiVideoService.updateVideoName(id, request.getName(), user.getNickname());
        return ResponseEntity.ok(resp);
    }
}
