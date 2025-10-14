package com.aiwebsite_back.api.inquiry.controller;

import com.aiwebsite_back.api.inquiry.service.InquiryService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api/inquiry")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping("/send")
    public ResponseEntity<String> sendInquiry(@RequestParam String name,
                                              @RequestParam String email,
                                              @RequestParam String content) {
        try {
            inquiryService.sendEmail(name, email, content);
            return ResponseEntity.ok("Email sent successfully");
        } catch (MessagingException | UnsupportedEncodingException e) {
            return ResponseEntity.status(500).body("Failed to send email");
        }
    }
}