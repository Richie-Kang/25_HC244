package com.aiwebsite_back.api.blog.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BlogResponse {
    private String message;

    public BlogResponse(String failedToUploadImage) {
        message = failedToUploadImage;
    }
}
