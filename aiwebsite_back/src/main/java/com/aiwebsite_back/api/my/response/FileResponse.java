package com.aiwebsite_back.api.my.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FileResponse {
    private Long id;
    private String name;
    private String url;
}