package com.aiwebsite_back.api.credit.service;

import com.aiwebsite_back.api.credit.CreditTransaction;
import com.aiwebsite_back.api.credit.repository.CreditTransactionRepository;
import com.aiwebsite_back.api.credit.response.CreditResponse;
import com.aiwebsite_back.api.credit.response.CreditTransactionResponse;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CreditService {

    private final CreditTransactionRepository creditTransactionRepository;
    private final UserRepository userRepository;

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    @Transactional
    public CreditResponse chargeCredit(Long userId, int amount) {
        User user = getUser(userId);
        CreditTransaction transaction = CreditTransaction.builder()
                .user(user)
                .amount(amount)
                .reason("충전")
                .build();

        creditTransactionRepository.save(transaction);

        // credits 필드 업데이트
        user.setCredits(user.getCredits() + amount);
        userRepository.save(user);

        return new CreditResponse(user.getCredits());
    }

    @Transactional
    public CreditResponse consumeCredit(Long userId, int amount, String reason) {
        User user = getUser(userId);
        // log.info("크레딧 차감 시작: userId={}, amount={}, currentCredits={}", userId,
        // amount, user.getCredits());

        if (user.getCredits() < amount) {
            log.warn("크레딧 부족: userId={}, amount={}, currentCredits={}", userId, amount, user.getCredits());
            throw new IllegalStateException("크레딧이 부족합니다.");
        }

        // 크레딧 차감
        Long newCredits = user.getCredits() - amount;
        // log.info("크레딧 차감 계산: currentCredits={} - amount={} = newCredits={}",
        // user.getCredits(), amount, newCredits);
        user.setCredits(newCredits);
        userRepository.save(user);

        // 트랜잭션 기록
        CreditTransaction transaction = CreditTransaction.builder()
                .user(user)
                .amount(-amount)
                .reason(reason)
                .build();
        creditTransactionRepository.save(transaction);

        // log.info("크레딧 차감 완료: userId={}, amount={}, 남은 크레딧={}", userId, amount,
        // user.getCredits());
        return new CreditResponse(user.getCredits());
    }

    public CreditResponse getCurrentCredit(Long userId) {
        User user = getUser(userId);
        // log.info(user.toString());
        return new CreditResponse(user.getCredits());
    }

    public List<CreditTransactionResponse> getCreditHistory(Long userId) {
        User user = getUser(userId);
        return creditTransactionRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(CreditTransactionResponse::from)
                .collect(Collectors.toList());
    }
}