package com.aiwebsite_back.api.blog.controller;

import com.aiwebsite_back.api.blog.request.BlogRequest;
import com.aiwebsite_back.api.blog.response.BlogGetResponse;
import com.aiwebsite_back.api.blog.response.BlogListResponse;
import com.aiwebsite_back.api.blog.response.BlogResponse;
import com.aiwebsite_back.api.blog.service.BlogImageLoadService;
import com.aiwebsite_back.api.blog.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final BlogImageLoadService blogImageLoadService;

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(
            @RequestPart("blog") BlogRequest blog,
            @RequestPart("image") MultipartFile image) {
        try {
            // 이미지 업로드 시 CloudFront URL 직접 반환
            String imageUrl = blogImageLoadService.uploadImage(image, "blogs");
            BlogResponse createdBlog = blogService.createBlog(blog, imageUrl);
            return ResponseEntity.ok(createdBlog);
        } catch (IOException e) {
            return ResponseEntity.status(500).body(new BlogResponse("Failed to upload image"));
        }
    }

    @GetMapping
    public ResponseEntity<List<BlogListResponse>> getAllBlogs() {
        List<BlogListResponse> blogListResponses = blogService.getAllBlogs().stream()
                .map(blog -> new BlogListResponse(
                        blog.getId(),
                        blog.getTitle(),
                        blog.getSubtitle(),
                        blog.getAuthor(),
                        blog.getImage(), // 이미 CloudFront URL이므로 변환 필요 없음
                        blog.getDate().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(blogListResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogGetResponse> getBlog(@PathVariable Long id) {
        BlogGetResponse blogResponse = blogService.getBlog(id);
        // 이미 CloudFront URL이므로 변환 필요 없음
        return ResponseEntity.ok(blogResponse);
    }
}