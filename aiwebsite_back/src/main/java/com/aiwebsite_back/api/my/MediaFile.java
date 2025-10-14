package com.aiwebsite_back.api.my;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;   // 파일명
    private String fileUrl;    // 실제 S3 경로 정보 등

    @ManyToOne
    @JoinColumn(name = "folder_id")
    private Folder folder;     // 어떤 폴더에 속해 있는지
}