package com.aiwebsite_back.api.admin.member.response;

import com.aiwebsite_back.api.user.User;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UserManagementResponse {
    private List<User> users;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean hasNext;
    private boolean hasPrevious;
}