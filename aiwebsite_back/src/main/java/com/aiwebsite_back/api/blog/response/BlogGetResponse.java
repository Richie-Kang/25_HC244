package com.aiwebsite_back.api.blog.response;

import lombok.Data;
import lombok.Setter;

@Data
public class BlogGetResponse {
    private String title;
    private String subtitle;
    private String author;
    private String content;
    private String image;
    private String date;

    public BlogGetResponse(String title, String subtitle, String author, String content, String image, String date) {
        this.title = title;
        this.subtitle = subtitle;
        this.author = author;
        this.content = content;
        this.image = image;
        this.date = date;
    }
}
