package com.aiwebsite_back.api.credit.repository;

import com.aiwebsite_back.api.credit.CouponTemplate;
import com.aiwebsite_back.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CouponTemplateRepository extends JpaRepository<CouponTemplate, Long> {
    Optional<CouponTemplate> findByCode(String code);
    List<CouponTemplate> findByExpiresAtGreaterThan(LocalDateTime dateTime);

    @Query("SELECT ct FROM CouponTemplate ct JOIN ct.redemptions r WHERE r.user = :user")
    List<CouponTemplate> findByRedemptionsUser(@Param("user") User user);
}
