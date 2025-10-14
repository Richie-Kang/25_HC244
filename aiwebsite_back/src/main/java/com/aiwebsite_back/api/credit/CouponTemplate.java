package com.aiwebsite_back.api.credit;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "coupon_template")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CouponTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 모든 사용자에게 공통된, 고유한 쿠폰 코드 */
    @Column(nullable = false, unique = true)
    private String code;

    /** 이 쿠폰이 지급할 크레딧 양 */
    @Column(nullable = false)
    private int creditAmount;

    /** 생성 시각 */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** 만료 시각 */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /** 이 템플릿을 실제로 사용한 사용자들의 내역 */
    @OneToMany(mappedBy = "couponTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<CouponRedemption> redemptions = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    /** 현재 만료되었는지 확인 */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
