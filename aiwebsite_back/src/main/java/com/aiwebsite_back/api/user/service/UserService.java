package com.aiwebsite_back.api.user.service;

import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.UserRole;
import com.aiwebsite_back.api.user.repository.UserRepository;
import com.aiwebsite_back.api.user.request.UserRequest;
import com.aiwebsite_back.api.user.response.UserResponse;
import com.aiwebsite_back.api.my.service.FolderService;
import com.aiwebsite_back.api.my.request.FolderRequest;
import com.aiwebsite_back.api.config.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final FolderService folderService;

    public User createOrUpdateGoogleUser(String email, String googleSub, String name) {
        // 1) provider, providerId로 사용자 조회
        Optional<User> optionalUser = userRepository.findByProviderAndProviderId("google", googleSub);

        if (optionalUser.isPresent()) {
            // 이미 구글 소셜 로그인으로 가입된 사용자
            User existingUser = optionalUser.get();
            // 필요하면 name 등 다른 필드 업데이트 가능
            existingUser.setUpdatedAt(LocalDateTime.now());
            userRepository.save(existingUser); // 주석 해제하면 DB 반영됨
            return existingUser;
        } else {
            // 2) 기존에 email만 등록된 사용자가 있는지 검사 (이메일 중복)
            Optional<User> userByEmail = userRepository.findByEmail(email);

            if (userByEmail.isPresent()) {
                // 이미 DB에 동일한 email로 가입된 경우 => 소셜 계정과 연결
                User existingUser = userByEmail.get();
                existingUser.setProvider("google");
                existingUser.setProviderId(googleSub);
                existingUser.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(existingUser);
            } else {
                // 3) 완전히 새로운 사용자 -> 회원가입 (DB insert)
                User newUser = User.builder()
                        .email(email)
                        .password("")
                        .provider("google")
                        .providerId(googleSub)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .role(UserRole.BEGINNER)
                        .nickname(name)
                        .credits(30L)
                        .build();
                User savedUser = userRepository.save(newUser);

                // upload 폴더와 fashn 폴더 생성
                createDefaultFolders(savedUser);

                return savedUser;
            }
        }
    }

    @Transactional
    public UserResponse registerUser(UserRequest user) {
        UserResponse userResponse = new UserResponse();
        try {
            User newUser = User.builder()
                    .email(user.getEmail())
                    .password(user.getPassword())
                    .createdAt(LocalDateTime.now())
                    .provider("email")
                    .providerId("email")
                    .role(UserRole.BEGINNER)
                    .build();

            User savedUser = userRepository.save(newUser);

            // upload 폴더와 fashn 폴더 생성
            createDefaultFolders(savedUser);

            userResponse.setMessage("User registered successfully");
        } catch (DataIntegrityViolationException e) {
            userResponse.setMessage("Email already exists");
        } catch (Exception e) {
            userResponse.setMessage("An error occurred during registration");
        }
        return userResponse;
    }

    private void createDefaultFolders(User user) {
        FolderRequest folderRequest = new FolderRequest();

        folderRequest.setName("upload");
        folderService.createFolder(folderRequest, new UserPrincipal(user));

        folderRequest.setName("fashn");
        folderService.createFolder(folderRequest, new UserPrincipal(user));

        folderRequest.setName("upscaler");
        folderService.createFolder(folderRequest, new UserPrincipal(user));
    }

    public UserResponse loginUser(UserRequest user) {
        UserResponse userResponse = new UserResponse();
        try {
            Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                userResponse.setMessage("Login successful");
            } else {
                userResponse.setMessage("Invalid email or password");
            }
        } catch (Exception e) {
            userResponse.setMessage("An error occurred during login");
        }
        return userResponse;
    }
}