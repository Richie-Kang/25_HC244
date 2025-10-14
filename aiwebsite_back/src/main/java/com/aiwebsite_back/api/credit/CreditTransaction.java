package com.aiwebsite_back.api.credit;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.aiwebsite_back.api.user.User;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class CreditTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;
    @Column(nullable = false)
    private String reason; // 충전 사유

    private int amount; // +면 충전, -면 차감
    private LocalDateTime createdAt;


    @Builder
    public CreditTransaction(User user, int amount, String reason) {
        this.user = user;
        this.amount = amount;
        this.reason = reason;
        this.createdAt = LocalDateTime.now();
    }
}
