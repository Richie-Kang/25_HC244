package com.aiwebsite_back.api.my;

import com.aiwebsite_back.api.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // 폴더 이름

    private String path; // S3 경로

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user; // 사용자 정보 (외래키)

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MediaFile> mediaFiles = new ArrayList<>(); // 폴더에 포함된 이미지/영상 리스트
}