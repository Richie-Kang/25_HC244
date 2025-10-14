package com.aiwebsite_back.api.credit.response;

import com.aiwebsite_back.api.credit.CouponTemplate;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class CouponListResponse {
    private boolean success;
    private String message;
    private List<CouponDto> coupons;

    @Getter
    @Builder
    public static class CouponDto {
        private String code;
        private int creditAmount;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
        private boolean expired;
        private int redemptionCount; // 사용 횟수

        public static CouponDto from(CouponTemplate template) {
            return CouponDto.builder()
                    .code(template.getCode())
                    .creditAmount(template.getCreditAmount())
                    .createdAt(template.getCreatedAt())
                    .expiresAt(template.getExpiresAt())
                    .expired(template.isExpired())
                    .redemptionCount(template.getRedemptions().size())
                    .build();
        }
    }

    public static CouponListResponse success(List<CouponTemplate> templates) {
        List<CouponDto> dtos = templates.stream()
                .map(CouponDto::from)
                .collect(Collectors.toList());

        return CouponListResponse.builder()
                .success(true)
                .message("쿠폰 목록 조회 성공")
                .coupons(dtos)
                .build();
    }

    public static CouponListResponse error(String message) {
        return CouponListResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}