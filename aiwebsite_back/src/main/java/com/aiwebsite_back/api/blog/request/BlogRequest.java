package com.aiwebsite_back.api.blog.request;

import lombok.Data;
@Data
public class BlogRequest {
    private Long id;

    private String title;

    private String subtitle;

    private String author;

    private String content;

}
