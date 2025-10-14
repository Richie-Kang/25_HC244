package com.aiwebsite_back.api.inquiry.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class InquiryService {
    private final JavaMailSender mailSender;

    public void sendEmail(String name, String email, String content) throws MessagingException, UnsupportedEncodingException {
        String subject = "Real Feel 광고 문의";
        String senderName = name;
        String mailContent = content;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(email, senderName);
        helper.setTo(email);
        helper.setSubject(subject);
        helper.setText(mailContent, true);

        mailSender.send(message);
    }
}
