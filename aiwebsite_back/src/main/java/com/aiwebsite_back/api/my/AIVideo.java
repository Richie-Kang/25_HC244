package com.aiwebsite_back.api.my;

import com.aiwebsite_back.api.admin.video.Video;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIVideo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String videoName;

    @Column(length = 2000)
    private String prompt;

    @Column(nullable = false)
    private String url;

    private String model;         // Model used for processing
    private VideoType mode;

    private String referenceFile; // mode에 따른 file (video면 video file, image면 image file, text면 null)

    private boolean share;
    private String creator;

    private String thumbnailUrl;  // Thumbnail URL
    private String s3Key;         // S3 object key

    private String format;        // Video format (mp4, etc.)
    private Long sizeInBytes;     // File size
    private Integer durationInSeconds;

    private long likeCount;     // Like count
    private long clickCount;    // Click count


    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum VideoType {
        IMAGE, VIDEO, TEXT
    }
}
