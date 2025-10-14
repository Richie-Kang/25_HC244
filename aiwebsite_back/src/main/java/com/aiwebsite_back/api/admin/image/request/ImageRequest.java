package com.aiwebsite_back.api.admin.image.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ImageRequest {
    private List<MultipartFile> images;
}