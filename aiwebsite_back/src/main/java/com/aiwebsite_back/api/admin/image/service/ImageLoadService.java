package com.aiwebsite_back.api.admin.image.service;

import com.aiwebsite_back.api.admin.image.Category;
import com.aiwebsite_back.api.admin.image.AdminImage;
import com.aiwebsite_back.api.admin.image.repository.ImageRepository;
import com.aiwebsite_back.api.admin.image.response.ImageAllResponse;
import com.aiwebsite_back.api.admin.image.response.ImageSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageLoadService {
    private final ImageRepository imageRepository;

    // 모든 이미지 가져오기
    public List<ImageAllResponse> getAllImages() {
        List<AdminImage> adminImages = imageRepository.findAllByOrderByCreatedAtDesc();
        return adminImages.stream()
                .map(adminImage -> new ImageAllResponse(
                        adminImage.getUrl(),
                        adminImage.getCategory().name(),
                        adminImage.getFileName()
                ))
                .collect(Collectors.toList());
    }

    // 이미지 검색 기능
    public List<ImageSearchResponse> searchRelatedImages(String imageName, Category category) {
        List<AdminImage> adminImages;
        if (imageName != null && category != null) {
            adminImages = imageRepository.findByFileNameContainingAndCategory(imageName, category);
        } else if (imageName != null) {
            adminImages = imageRepository.findByFileNameContaining(imageName);
        } else if (category != null) {
            adminImages = imageRepository.findByCategory(category);
        } else {
            adminImages = imageRepository.findAllByOrderByCreatedAtDesc();
        }

        return adminImages.stream()
                .map(adminImage -> new ImageSearchResponse(
                        adminImage.getUrl(),
                        adminImage.getFileName(),
                        adminImage.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
    }
}