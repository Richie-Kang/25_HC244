package com.aiwebsite_back.api.admin.video;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String prompt;

    @Column(nullable = false)
    private String url;           // CloudFront URL for distribution

    private long likeCount;     // Like count
    private long clickCount;    // Click count


    private String s3Key;         // S3 object key

    private String format;        // Video format (mp4, etc.)
    private Long sizeInBytes;     // File size
    private Integer durationInSeconds;
    private String model;         // Model used for processing

    private VideoType mode;
    private String referenceFile; // mode에 따른 file (video면 video file, image면 image file, text면 null)

    private boolean share;
    private String creator;

    private String thumbnailUrl;  // Thumbnail URL

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum VideoType {
        IMAGE, VIDEO, TEXT
    }
}