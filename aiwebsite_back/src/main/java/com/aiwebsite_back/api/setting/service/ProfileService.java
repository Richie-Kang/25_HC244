package com.aiwebsite_back.api.setting.service;

import com.aiwebsite_back.api.my.repository.AIVideoRepository;
import com.aiwebsite_back.api.setting.request.ProfileRequest;
import com.aiwebsite_back.api.setting.response.ProfileResponse;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final AIVideoRepository aiVideoRepository;

    @Transactional
    public ProfileResponse updateNickname(Long userId, String newNickname) {
        ProfileResponse response = new ProfileResponse();

        try {
            Optional<User> optionalUser = userRepository.findById(userId);

            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                String oldNickname = user.getNickname();
                
                // 닉네임 업데이트
                user.setNickname(newNickname);
                user.setUpdatedAt(LocalDateTime.now());
                
                // 마지막 닉네임 변경 시간 확인
                LocalDateTime lastChange = user.getLastNicknameChange();
                boolean shouldUpdateVideos = false;
                
                // 마지막 변경이 null이거나 30일 이상 지났으면 AIVideo creator 업데이트
                if (lastChange == null || ChronoUnit.DAYS.between(lastChange, LocalDateTime.now()) >= 30) {
                    shouldUpdateVideos = true;
                }
                
                // 현재 시간으로 마지막 닉네임 변경 시간 업데이트
                user.setLastNicknameChange(LocalDateTime.now());
                userRepository.save(user);
                
                // 30일 이상 지났다면 creator 필드 업데이트
                if (shouldUpdateVideos && oldNickname != null) {
                    aiVideoRepository.updateCreatorName(oldNickname, newNickname);
                }

                response.setSuccess(true);
                response.setMessage("Nickname updated successfully");
                response.setNickname(newNickname);
            } else {
                response.setSuccess(false);
                response.setMessage("User not found");
            }
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Error updating nickname: " + e.getMessage());
        }

        return response;
    }
}
