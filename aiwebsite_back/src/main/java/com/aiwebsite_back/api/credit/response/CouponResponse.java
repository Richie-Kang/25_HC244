// 파일: src/main/java/com/aiwebsite_back/api/credit/response/CouponResponse.java
package com.aiwebsite_back.api.credit.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CouponResponse {
    /** 처리 성공 여부 */
    private boolean success;
    /** 메시지(오류 또는 성공 메시지) */
    private String message;
    /** 쿠폰 코드 (성공 시에만 포함) */
    private String code;
    /** 크레딧 양 (성공 시에만 포함) */
    private Integer creditAmount;
    /** 만료 시각 (성공 시에만 포함) */
    private LocalDateTime expiresAt;

    /** 성공 응답 생성 */
    public static CouponResponse success(String message, String code, int creditAmount, LocalDateTime expiresAt) {
        return CouponResponse.builder()
                .success(true)
                .message(message)
                .code(code)
                .creditAmount(creditAmount)
                .expiresAt(expiresAt)
                .build();
    }

    /** 오류 응답 생성 */
    public static CouponResponse error(String message) {
        return CouponResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
