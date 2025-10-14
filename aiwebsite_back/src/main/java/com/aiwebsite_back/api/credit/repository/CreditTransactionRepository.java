package com.aiwebsite_back.api.credit.repository;

import com.aiwebsite_back.api.credit.CreditTransaction;
import com.aiwebsite_back.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    List<CreditTransaction> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT COALESCE(SUM(ct.amount), 0) FROM CreditTransaction ct WHERE ct.user = :user")
    int getCurrentCredit(@Param("user") User user);
} 