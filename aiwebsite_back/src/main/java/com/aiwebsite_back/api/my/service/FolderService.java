package com.aiwebsite_back.api.my.service;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.my.Folder;
import com.aiwebsite_back.api.my.repository.FolderRepository;
import com.aiwebsite_back.api.my.request.FolderRequest;
import com.aiwebsite_back.api.my.response.FolderResponse;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final UserRepository userRepository;
    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    // CloudFront 도메인 (예: d1234abcd.cloudfront.net)
    @Value("${cloud.aws.cloudfront.distribution-domain}")
    private String cloudfrontDomain;

    /**
     * 폴더 생성
     */
    @Transactional
    public FolderResponse createFolder(FolderRequest request, UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();
        // 폴더 경로: 사용자 ID와 폴더 이름 조합
        String folderPath = userId + "/" + request.getName();

        // S3에 빈 폴더 생성 (빈 객체 업로드)
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(0);
        amazonS3.putObject(
                new PutObjectRequest(bucketName, folderPath + "/", new ByteArrayInputStream(new byte[0]), metadata));

        // DB에 폴더 정보 저장
        Folder folder = new Folder();
        folder.setName(request.getName());
        folder.setPath(folderPath);

        Optional<User> optionalUser = userRepository.findById(userId);
        optionalUser.ifPresent(folder::setUser);

        folderRepository.save(folder);

        // FolderResponse에는 폴더 이름과 S3 경로만 포함 (CloudFront URL은 파일 조회 시 사용)
        FolderResponse response = new FolderResponse();
        response.setId(folder.getId());
        response.setName(folder.getName());
        response.setPath(folder.getPath());
        return response;
    }

    /**
     * 사용자 폴더 목록 조회
     */
    public List<FolderResponse> getFoldersByUser(UserPrincipal userPrincipal) {
        List<Folder> folders = folderRepository.findByUserId(userPrincipal.getUser().getId());
        return folders.stream()
                .map(folder -> {
                    FolderResponse response = new FolderResponse();
                    response.setId(folder.getId());
                    response.setName(folder.getName());
                    response.setPath(folder.getPath());
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * 폴더 삭제
     */
    @Transactional
    public void deleteFolder(Long folderId, UserPrincipal userPrincipal) {
        Long userId = userPrincipal.getUser().getId();

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        if (folder.getUser() == null || !folder.getUser().getId().equals(userId)) {
            throw new IllegalStateException("해당 폴더를 삭제할 권한이 없습니다.");
        }

        // S3 폴더 삭제 (폴더 경로에 trailing slash 포함)
        amazonS3.deleteObject(bucketName, folder.getPath() + "/");

        folderRepository.delete(folder);
    }
}
