package com.aiwebsite_back.api.admin.image.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageAllResponse {
    private String url;
    private String category;
    private String fileName; // 이미지 파일 이름

}
