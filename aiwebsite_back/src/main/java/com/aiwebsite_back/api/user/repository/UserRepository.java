package com.aiwebsite_back.api.user.repository;

import com.aiwebsite_back.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    // 소셜 로그인을 위해 provider / providerId 로 찾는 메서드
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
