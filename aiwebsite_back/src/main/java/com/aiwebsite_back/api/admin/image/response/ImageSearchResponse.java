package com.aiwebsite_back.api.admin.image.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ImageSearchResponse {
    private String url;         // 이미지 URL
    private String fileName;    // 이미지 파일 이름
    private String lastModified; // 마지막 수정 날짜
}
