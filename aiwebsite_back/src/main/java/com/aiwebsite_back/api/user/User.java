package com.aiwebsite_back.api.user;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@NoArgsConstructor
@Data
@Table(name = "users")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String nickname;

    @Column
    private String password;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role = UserRole.BEGINNER;  // Default role

    @Column(nullable = false)
    private Long credits = 0L;

    @Column
    private LocalDateTime lastNicknameChange;

    @Builder
    public User(String email, String password, LocalDateTime createdAt, String provider,
                String providerId, LocalDateTime updatedAt, UserRole role, String nickname, Long credits) {
        this.email = email;
        this.password = password;
        this.createdAt = createdAt;
        this.provider = provider;
        this.providerId = providerId;
        this.updatedAt = updatedAt;
        this.nickname = nickname;
        this.role = (role != null) ? role : UserRole.BEGINNER;
        this.credits = credits;
        this.lastNicknameChange = createdAt; // 계정 생성 시 닉네임 변경 시간 초기화
    }

    public void setUpdatedAt(LocalDateTime now) {
        this.updatedAt = now;
    }
}
