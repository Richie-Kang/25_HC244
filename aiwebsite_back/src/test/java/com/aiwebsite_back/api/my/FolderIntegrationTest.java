package com.aiwebsite_back.api.my;

import com.aiwebsite_back.api.my.request.FolderRequest;
import com.aiwebsite_back.api.my.response.FolderResponse;
import com.aiwebsite_back.api.my.service.FolderService;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class FolderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FolderService folderService;

    @Autowired
    private UserRepository userRepository;

    // Configuration to provide mock beans
    @Configuration
    static class TestConfig {
        @Bean
        @Primary
        public FolderService mockFolderService() {
            return mock(FolderService.class);
        }

        @Bean
        @Primary
        public UserRepository mockUserRepository() {
            return mock(UserRepository.class);
        }
    }

    @Test
    @DisplayName("인증된 사용자의 폴더 생성 통합 테스트")
    @WithMockUser
    void createFolder_integration() throws Exception {
        // Given
        Long userId = 1L;
        String folderName = "테스트 폴더";

        FolderRequest request = new FolderRequest();
        request.setName(folderName);

        FolderResponse response = new FolderResponse();
        response.setId(1L);
        response.setName(folderName);
        response.setPath(userId + "/" + folderName);

        User user = new User();
        user.setId(userId);

        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        when(folderService.createFolder(any(), any())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/folders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .cookie(new Cookie("auth-token", "test-token"))
                        .with(csrf()))
                .andExpect(status().isOk());
    }
}