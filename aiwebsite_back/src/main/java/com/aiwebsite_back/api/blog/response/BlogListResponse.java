package com.aiwebsite_back.api.blog.response;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BlogListResponse {
    private Long id;
    private String title;
    private String subtitle;
    private String author;
    private String image;
    private String date;

    public BlogListResponse(Long id,String title, String subtitle, String author, String image, String string) {
        this.id = id;
        this.title = title;
        this.subtitle = subtitle;
        this.author = author;
        this.image = image;
        this.date = string;
    }
}
