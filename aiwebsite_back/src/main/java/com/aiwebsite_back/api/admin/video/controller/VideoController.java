package com.aiwebsite_back.api.admin.video.controller;

import com.aiwebsite_back.api.admin.video.Video;
import com.aiwebsite_back.api.admin.video.request.VideoRequest;
import com.aiwebsite_back.api.admin.video.response.VideoResponse;
import com.aiwebsite_back.api.admin.video.service.VideoService;
import com.aiwebsite_back.api.config.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/videos")
@RequiredArgsConstructor
@Slf4j
public class VideoController {
    private final VideoService videoService;

    @PostMapping
    public ResponseEntity<VideoResponse> uploadVideo(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestPart("AIVideo") MultipartFile aiVideo,
            @RequestPart(value = "referenceFile", required = false) MultipartFile modeFile,
            @RequestPart("request") VideoRequest request) throws IOException {
        // log.info("userPrincipal: {}", userPrincipal);
        // log.info("Processing upload request with AIVideo: {}, modeFile: {}",
        // aiVideo.getOriginalFilename(),
        // modeFile != null ? modeFile.getOriginalFilename() : "none");

        Video.VideoType videoType = Video.VideoType.VIDEO; // Default type is VIDEO

        if (modeFile != null) {
            String contentType = modeFile.getContentType();
            if (contentType != null && contentType.startsWith("image/")) {
                videoType = Video.VideoType.IMAGE;
                // log.info("Image modeFile detected: {}", modeFile.getOriginalFilename());
            } else if (contentType != null && contentType.startsWith("video/")) {
                videoType = Video.VideoType.VIDEO;
                // log.info("Video modeFile detected: {}", modeFile.getOriginalFilename());
            }
        } else {
            // log.info("No modeFile provided, using only AIVideo");
        }

        // Pass both AIVideo and modeFile to the service
        VideoResponse response = videoService.uploadVideo(request, aiVideo, modeFile, videoType, userPrincipal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<VideoResponse>> getAllVideos() {
        List<VideoResponse> videos = videoService.getAllVideos();
        return ResponseEntity.ok(videos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoResponse> getVideo(@PathVariable Long id) {
        VideoResponse video = videoService.getVideo(id);
        return ResponseEntity.ok(video);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }
}