package com.aiwebsite_back.api.user.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class OauthController {
    private final UserRepository userRepository;
    private final Environment environment;
    /**
     * 구글 로그인 리다이렉트 (프런트에서 이 경로로 요청하면, 내부적으로 /oauth2/authorization/google 로 이동)
     */
    @GetMapping("/google")
    public void googleLogin(HttpServletResponse response) throws IOException {
        // 현재 활성화된 프로필 확인
        boolean isProdProfile = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        // 환경에 따라 리다이렉트 URL 결정
        String redirectUrl = isProdProfile
                ? "https://trynicai.com/oauth2/authorization/google"
                : "http://localhost:8080/oauth2/authorization/google";
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // 1. Clear auth-token cookie
        ResponseCookie jwtCookie = ResponseCookie.from("auth-token", "")
                .path("/")
                .httpOnly(false)
                .maxAge(0)
                .secure(false)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        // 2. Clear userRole cookie
        ResponseCookie roleCookie = ResponseCookie.from("userRole", "")
                .path("/")
                .httpOnly(false)
                .maxAge(0)
                .secure(false)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, roleCookie.toString());

        // 3. Return success response
        Map<String, String> result = new HashMap<>();
        result.put("message", "로그아웃 되었습니다");

        return ResponseEntity.ok(result);
    }

    /**
     * 현재 로그인 사용자 정보 조회
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        // 인증되지 않은 사용자 처리
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자입니다");
        }

        // UserPrincipal에서 이메일을 가져옵니다
        String email = userPrincipal.getUsername();

        // UserRepository에서 email 기반으로 유저 정보 확인
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("사용자를 찾을 수 없습니다");
        }

        User user = userOpt.get();

        // 응답 데이터 구성 (쿠키에 담기는 정보와 유사하게)
        Map<String, Object> result = new HashMap<>();
        result.put("email", email);
        result.put("id", user.getId());
        result.put("nickname", user.getNickname());
        result.put("role", user.getRole().name());
        result.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(result);
    }
}
