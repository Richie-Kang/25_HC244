package com.aiwebsite_back.api.credit.repository;

import com.aiwebsite_back.api.credit.CouponRedemption;
import com.aiwebsite_back.api.credit.CouponTemplate;
import com.aiwebsite_back.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, Long> {
    Optional<CouponRedemption> findByCouponTemplateAndUser(CouponTemplate template, User user);
}
