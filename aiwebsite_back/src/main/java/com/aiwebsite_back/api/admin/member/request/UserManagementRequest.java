package com.aiwebsite_back.api.admin.member.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserManagementRequest {
    private Integer page = 0;
    private Integer size = 20;
    private String direction; // "next" or "prev"
}