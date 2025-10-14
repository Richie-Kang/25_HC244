package com.aiwebsite_back.api.credit.controller;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.credit.request.CreditChargeRequest;
import com.aiwebsite_back.api.credit.request.CreditConsumeRequest;
import com.aiwebsite_back.api.credit.response.CreditResponse;
import com.aiwebsite_back.api.credit.response.CreditTransactionResponse;
import com.aiwebsite_back.api.credit.service.CreditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/credits")
public class CreditController {

    private final CreditService creditService;

    @PostMapping("/charge")
    public ResponseEntity<CreditResponse> chargeCredit(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreditChargeRequest request) {
        return ResponseEntity.ok(creditService.chargeCredit(principal.getUser().getId(), request.getAmount()));
    }

    @PostMapping("/consume")
    public ResponseEntity<CreditResponse> consumeCredit(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreditConsumeRequest request) {
        try {
            CreditResponse response = creditService.consumeCredit(
                    principal.getUser().getId(),
                    request.getAmount(),
                    request.getReason());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<CreditResponse> getCurrentCredit(
            @AuthenticationPrincipal UserPrincipal principal) {
        CreditResponse creditResponse = creditService.getCurrentCredit(principal.getUser().getId());
        return ResponseEntity.ok(creditResponse);
    }

    @GetMapping("/history")
    public ResponseEntity<List<CreditTransactionResponse>> getCreditHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(creditService.getCreditHistory(principal.getUser().getId()));
    }
}