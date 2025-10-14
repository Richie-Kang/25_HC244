package com.aiwebsite_back.api.blog.service;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogImageLoadService {

    private final AmazonS3Client amazonS3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.cloudfront.distribution-domain}")
    private String cloudfrontDomain;

    public String uploadImage(MultipartFile image, String dirName) throws IOException {
        File uploadFile = convert(image)
                .orElseThrow(() -> new IllegalArgumentException("File conversion failed"));

        // 파일 이름(경로) 생성: 예) blogs/myImage.jpg
        String fileName = dirName + "/" + UUID.randomUUID() + "-" + uploadFile.getName();

        // 메타데이터 설정
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(uploadFile.length());
        metadata.setContentType(image.getContentType());

        // S3에 업로드 (PublicRead ACL 적용)
        amazonS3Client.putObject(
                new PutObjectRequest(bucketName, fileName, uploadFile)
                        .withCannedAcl(CannedAccessControlList.PublicRead));

        removeNewFile(uploadFile);

        // CloudFront URL 반환
        return "https://" + cloudfrontDomain + "/" + encodeS3Key(fileName);
    }

    private Optional<File> convert(MultipartFile multipartFile) throws IOException {
        File convertFile = new File(multipartFile.getOriginalFilename());
        if (convertFile.createNewFile()) {
            try (FileOutputStream fos = new FileOutputStream(convertFile)) {
                fos.write(multipartFile.getBytes());
            }
            return Optional.of(convertFile);
        }
        return Optional.empty();
    }

    private void removeNewFile(File targetFile) {
        targetFile.delete();
    }

    // S3 객체 키(파일 경로)의 각 부분을 URL 인코딩 (슬래시("/")는 그대로 유지)
    private String encodeS3Key(String key) {
        String[] parts = key.split("/");
        StringBuilder encodedKey = new StringBuilder();
        for (int i = 0; i < parts.length; i++) {
            encodedKey.append(URLEncoder.encode(parts[i], StandardCharsets.UTF_8));
            if (i < parts.length - 1) {
                encodedKey.append("/");
            }
        }
        return encodedKey.toString();
    }

    // 기존 S3 URL을 CloudFront URL로 변환
    public String getImageUrl(String fileName) {
        return "https://" + cloudfrontDomain + "/" + encodeS3Key(fileName);
    }
}