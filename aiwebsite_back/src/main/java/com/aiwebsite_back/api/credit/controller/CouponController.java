package com.aiwebsite_back.api.credit.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.credit.request.CouponRequest;
import com.aiwebsite_back.api.credit.request.CouponUseRequest;
import com.aiwebsite_back.api.credit.response.CouponListResponse;
import com.aiwebsite_back.api.credit.response.CouponResponse;
import com.aiwebsite_back.api.credit.service.CouponService;
import com.aiwebsite_back.api.user.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/coupons")
public class CouponController {
    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<CouponResponse> registerCoupon(@RequestBody CouponRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        if (user.getUser().getRole() != UserRole.ADMIN) {
            return ResponseEntity.ok(CouponResponse.error("관리자 권한이 필요합니다"));
        }
        CouponResponse response = couponService.registerCoupon(request.getCode(), request.getCreditAmount(),
                request.getExpiresAt());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<CouponListResponse> getAllCoupons(@AuthenticationPrincipal UserPrincipal user) {
        if (user.getUser().getRole() != UserRole.ADMIN) {
            return ResponseEntity.ok(CouponListResponse.error("관리자 권한이 필요합니다"));
        }
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/available")
    public ResponseEntity<CouponListResponse> getAvailableCoupons() {
        return ResponseEntity.ok(couponService.getAvailableCoupons());
    }

    @GetMapping("/my")
    public ResponseEntity<CouponListResponse> getUserCoupons(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(couponService.getUserCoupons(user.getUser()));
    }

    @PostMapping("/use")
    public ResponseEntity<CouponResponse> useCoupon(
            @RequestBody CouponUseRequest request,
            @AuthenticationPrincipal UserPrincipal user) {
        String code = request.getCode();
        CouponResponse response = couponService.useCoupon(code, user.getUser());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/release")
    public ResponseEntity<CouponResponse> releaseCoupon(@RequestBody String code,
            @AuthenticationPrincipal UserPrincipal user) {
        if (user.getUser().getRole() != UserRole.ADMIN) {
            return ResponseEntity.ok(CouponResponse.error("관리자 권한이 필요합니다"));
        }
        CouponResponse response = couponService.releaseCoupon(code);
        return ResponseEntity.ok(response);
    }
}