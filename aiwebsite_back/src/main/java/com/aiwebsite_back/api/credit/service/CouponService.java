// 파일: src/main/java/com/aiwebsite_back/api/credit/service/CouponService.java
package com.aiwebsite_back.api.credit.service;

import com.aiwebsite_back.api.credit.CouponRedemption;
import com.aiwebsite_back.api.credit.CouponTemplate;
import com.aiwebsite_back.api.credit.repository.CouponRedemptionRepository;
import com.aiwebsite_back.api.credit.repository.CouponTemplateRepository;
import com.aiwebsite_back.api.credit.response.CouponListResponse;
import com.aiwebsite_back.api.credit.response.CouponResponse;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponTemplateRepository templateRepository;
    private final CouponRedemptionRepository redemptionRepository;
    private final UserRepository userRepository;
    /**
     * 관리자용: 쿠폰 코드(code)를 새로 등록
     */
    @Transactional
    public CouponResponse registerCoupon(String code, int creditAmount, LocalDateTime expiresAt) {
        // 중복 코드 방지
        if (templateRepository.findByCode(code).isPresent()) {
            return CouponResponse.error("이미 존재하는 쿠폰 코드입니다.");
        }

        // 템플릿 생성·저장
        CouponTemplate template = CouponTemplate.builder()
                .code(code)
                .creditAmount(creditAmount)
                .expiresAt(expiresAt)
                .build();
        templateRepository.save(template);

        return CouponResponse.success(
                "쿠폰 등록 성공",
                template.getCode(),
                template.getCreditAmount(),
                template.getExpiresAt()
        );
    }

    /**
     * 관리자용: 모든 쿠폰 템플릿 목록 조회
     */
    @Transactional(readOnly = true)
    public CouponListResponse getAllCoupons() {
        List<CouponTemplate> templates = templateRepository.findAll();
        return CouponListResponse.success(templates);
    }

    /**
     * 사용자용: 사용 가능한(만료되지 않은) 쿠폰 목록 조회
     */
    @Transactional(readOnly = true)
    public CouponListResponse getAvailableCoupons() {
        LocalDateTime now = LocalDateTime.now();
        List<CouponTemplate> templates = templateRepository.findByExpiresAtGreaterThan(now);
        return CouponListResponse.success(templates);
    }

    /**
     * 사용자용: 사용자가 사용한 쿠폰 목록 조회
     */
    @Transactional(readOnly = true)
    public CouponListResponse getUserCoupons(User user) {
        List<CouponTemplate> templates = templateRepository.findByRedemptionsUser(user);
        return CouponListResponse.success(templates);
    }

    /**
     * 사용자용: 쿠폰(code) 사용 요청
     */
    @Transactional
    public CouponResponse useCoupon(String code, User user) {

        // 1) 템플릿 조회
        CouponTemplate template = templateRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠폰 코드입니다."));

        // 2) 만료 체크
        if (template.isExpired()) {
            return CouponResponse.error("만료된 쿠폰입니다.");
        }

        // 3) 중복 사용 방지
        boolean alreadyUsed = redemptionRepository
                .findByCouponTemplateAndUser(template, user)
                .isPresent();
        if (alreadyUsed) {
            return CouponResponse.error("이미 이 쿠폰을 사용하셨습니다.");
        }

        // 4) 사용 내역 저장
        CouponRedemption redemption = CouponRedemption.builder()
                .couponTemplate(template)
                .user(user)
                .build();
        redemptionRepository.save(redemption);

        // 5) 사용자 크레딧 적립
        // credits 필드 업데이트
        user.setCredits(user.getCredits() + template.getCreditAmount());
        userRepository.save(user);

        return CouponResponse.success(
                "쿠폰 사용 성공",
                template.getCode(),
                template.getCreditAmount(),
                template.getExpiresAt()
        );
    }

    /**
     * 관리자용: 특정 쿠폰(code)의 사용 내역을 모두 해제 (리셋)
     */
    @Transactional
    public CouponResponse releaseCoupon(String code) {
        // 템플릿 조회
        CouponTemplate template = templateRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 쿠폰 코드입니다."));

        // 해당 템플릿에 연결된 모든 사용 내역 삭제
        redemptionRepository.deleteAll(template.getRedemptions());

        return CouponResponse.success(
                "쿠폰 사용 내역 해제 성공",
                template.getCode(),
                template.getCreditAmount(),
                template.getExpiresAt()
        );
    }
}
