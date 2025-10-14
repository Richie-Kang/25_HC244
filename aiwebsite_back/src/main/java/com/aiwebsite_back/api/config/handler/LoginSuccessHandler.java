package com.aiwebsite_back.api.config.handler;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import com.aiwebsite_back.api.user.service.UserService;
import com.aiwebsite_back.api.util.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.time.Duration;
import java.util.Arrays;

@Slf4j
@RequiredArgsConstructor
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final ObjectMapper objectMapper;
    private final JwtUtil jwtUtil;
    private final String secret;
    private final UserService userService;
    private final UserRepository userRepository;
    private final Environment environment;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        String loginUserEmail = null;
        User loginUser = null;

        // OAuth2 로그인 (구글)
        if (authentication.getPrincipal() instanceof OAuth2User oAuth2User) {
            String email = (String) oAuth2User.getAttributes().get("email");
            String sub = (String) oAuth2User.getAttributes().get("sub");
            String name = (String) oAuth2User.getAttributes().get("name");

            // 소셜 사용자 DB처리
            loginUser = userService.createOrUpdateGoogleUser(email, sub, name);
            loginUserEmail = loginUser.getEmail();
        }
        // 이메일/비밀번호 로그인
        else if (authentication.getPrincipal() instanceof UserPrincipal userPrincipal) {
            loginUserEmail = userPrincipal.getUsername();
            loginUser = userRepository.findByEmail(loginUserEmail)
                    .orElseThrow(() -> new IllegalStateException("User not found"));
        } else {
            log.warn("[인증 성공] 알 수 없는 Principal 타입: {}", authentication.getPrincipal());
            response.sendRedirect("http://localhost:3000?error=unknown_principal");
            return;
        }

        if (loginUser != null) {
            try {
                long expirationMillis = 360000000L;
                String jwt = jwtUtil.generateToken(loginUserEmail, loginUser.getId(), secret, expirationMillis);
                // log.info("[JWT 생성 성공] userId={}", loginUser.getId());

                ResponseCookie jwtCookie;
                ResponseCookie roleCookie;

                // 현재 활성화된 프로필 확인
                boolean isProdProfile = Arrays.asList(environment.getActiveProfiles()).contains("prod");
                String frontendUrl = environment.getProperty("frontend.url", "http://localhost:3000");

                if (isProdProfile) {
                    // 프로덕션 환경 설정
                    jwtCookie = ResponseCookie.from("auth-token", jwt)
                            .path("/")
                            .httpOnly(true) // JS 접근 차단 (XSS 방지)
                            .maxAge(Duration.ofSeconds(expirationMillis / 1000))
                            .secure(true) // HTTPS일 때만 전송
                            .sameSite("None") // cross-origin 요청 허용
                            .build();

                    roleCookie = ResponseCookie.from("userRole", loginUser.getRole().name())
                            .path("/")
                            .httpOnly(true) // JS 접근 차단
                            .maxAge(Duration.ofSeconds(expirationMillis / 1000))
                            .secure(true) // HTTPS일 때만 전송
                            .sameSite("None") // cross-origin 요청 허용
                            .build();
                } else {
                    // 개발 환경 설정
                    jwtCookie = ResponseCookie.from("auth-token", jwt)
                            .path("/")
                            .httpOnly(false) // 개발 환경에서는 JS에서 접근 가능
                            .maxAge(Duration.ofSeconds(expirationMillis / 1000))
                            .secure(false) // 개발 환경에서는 HTTP도 허용
                            .build();

                    roleCookie = ResponseCookie.from("userRole", loginUser.getRole().name())
                            .path("/")
                            .httpOnly(false) // 개발 환경에서는 JS에서 접근 가능
                            .maxAge(Duration.ofSeconds(expirationMillis / 1000))
                            .secure(false) // 개발 환경에서는 HTTP도 허용
                            .build();
                }

                response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());
                response.addHeader(HttpHeaders.SET_COOKIE, roleCookie.toString());

                // 프론트엔드로 리다이렉트
                response.sendRedirect(frontendUrl);
            } catch (Exception e) {
                log.error("[JWT 생성 실패]", e);
                response.sendRedirect("http://localhost:3000?error=jwt_error");
            }
        } else {
            response.sendRedirect("http://localhost:3000?error=no_user_found");
        }
    }
}
