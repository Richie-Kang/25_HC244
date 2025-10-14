package com.aiwebsite_back.api.admin.image.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.admin.image.Category;
import com.aiwebsite_back.api.admin.image.response.ImageAllResponse;
import com.aiwebsite_back.api.admin.image.response.ImageResponse;
import com.aiwebsite_back.api.admin.image.response.ImageSearchResponse;
import com.aiwebsite_back.api.admin.image.service.ImageLoadService;
import com.aiwebsite_back.api.admin.image.service.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Slf4j
public class ImageController {

    private final ImageLoadService imageLoadService;
    private final ImageService imageService;

    @PostMapping("/upload")
    public ResponseEntity<ImageResponse> uploadImages(
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam("category") Category category,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ImageResponse response = imageService.uploadImages(images, category, userPrincipal);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ImageAllResponse>> getAllImages() {
        List<ImageAllResponse> images = imageLoadService.getAllImages();
        return ResponseEntity.ok(images);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ImageSearchResponse>> searchRelatedImages(
            @RequestParam(value = "imageName", required = false) String imageName,
            @RequestParam(value = "category", required = false) Category category) {
        List<ImageSearchResponse> relatedImages = imageLoadService.searchRelatedImages(imageName, category);
        return ResponseEntity.ok(relatedImages);
    }
}