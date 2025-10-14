package com.aiwebsite_back.api.credit;

import com.aiwebsite_back.api.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "coupon_redemption",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_coupon_template_user",
                        columnNames = {"coupon_template_id", "user_id"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CouponRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 템플릿을 사용했는지 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coupon_template_id", nullable = false)
    private CouponTemplate couponTemplate;

    /** 어떤 유저가 사용했는지 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 사용 시각 */
    @Column(nullable = false, updatable = false)
    private LocalDateTime redeemedAt;

    @PrePersist
    protected void onRedeem() {
        this.redeemedAt = LocalDateTime.now();
    }
}
