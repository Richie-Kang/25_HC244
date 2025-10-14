package com.aiwebsite_back.api.blog;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Blog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String title;
    @Column(nullable = false)
    private String subtitle;
    @Column(nullable = false)
    private String author;
    @Column(nullable = false)
    private LocalDateTime date;
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    @Column(nullable = false)
    private String image;

    public Blog(String title, String subtitle, String author, LocalDateTime date, String content, String image) {
        this.title = title;
        this.subtitle = subtitle;
        this.author = author;
        this.date = date;
        this.content = content;
        this.image = image;
    }
}
