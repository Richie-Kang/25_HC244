package com.aiwebsite_back.api.my.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FolderResponse {
    private Long id; // 폴더 ID
    private String name; // 폴더 이름
    private String path; // 폴더 S3 경로
}