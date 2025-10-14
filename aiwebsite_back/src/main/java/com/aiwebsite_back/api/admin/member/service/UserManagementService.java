package com.aiwebsite_back.api.admin.member.service;

import com.aiwebsite_back.api.admin.member.request.UserManagementRequest;
import com.aiwebsite_back.api.admin.member.response.UserManagementResponse;
import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.UserRole;
import com.aiwebsite_back.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService {
    private final UserRepository userRepository;

    public UserManagementResponse getUserList(UserManagementRequest request, UserPrincipal user) {
        // Get authenticated user and check admin role

        if (user.getUser().getRole() != UserRole.ADMIN) {
            log.warn("관리자 권한 없는 사용자의 접근 시도: {}", user.getUser().getId());
            throw new AccessDeniedException("관리자 권한이 필요합니다");
        }

        int page = request.getPage();
        int size = request.getSize();

        // Handle navigation direction
        if ("next".equals(request.getDirection()) && page < Integer.MAX_VALUE) {
            page++;
            // log.debug("다음 페이지로 이동: {}", page);
        } else if ("prev".equals(request.getDirection()) && page > 0) {
            page--;
            // log.debug("이전 페이지로 이동: {}", page);
        }

        // Create pageable object
        Pageable pageable = PageRequest.of(page, size);

        Page<User> userPage = userRepository.findAll(pageable);

        UserManagementResponse response = UserManagementResponse.builder()
                .users(userPage.getContent())
                .currentPage(page)
                .totalPages(userPage.getTotalPages())
                .totalElements(userPage.getTotalElements())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .build();

        return response;
    }
}