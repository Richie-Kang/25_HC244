// 파일: src/main/java/com/aiwebsite_back/api/credit/request/CouponRequest.java
package com.aiwebsite_back.api.credit.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CouponRequest {
    /** 쿠폰 코드 */
    private String code;
    /** 지급할 크레딧 양 */
    private int creditAmount;
    /** 만료 시각 */
    private LocalDateTime expiresAt;
}
