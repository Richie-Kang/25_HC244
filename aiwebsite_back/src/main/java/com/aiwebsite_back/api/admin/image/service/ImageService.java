package com.aiwebsite_back.api.admin.image.service;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.admin.image.Category;
import com.aiwebsite_back.api.admin.image.AdminImage;
import com.aiwebsite_back.api.admin.image.repository.ImageRepository;
import com.aiwebsite_back.api.admin.image.response.ImageResponse;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.sksamuel.scrimage.ImmutableImage;
import com.sksamuel.scrimage.webp.WebpWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final AmazonS3Client amazonS3Client;
    private final ImageRepository imageRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.cloudfront.distribution-domain}")
    private String cloudfrontDomain;

    // 이미지 업로드 서비스
    public ImageResponse uploadImages(List<MultipartFile> images, Category category, UserPrincipal userPrincipal) {
        List<String> fileUrls = new ArrayList<>();
        try {
            for (MultipartFile image : images) {
                // 파일명 생성 (WebP 확장자 적용)
                String fileName = generateFileName(image, category);
                // log.info("Uploading image: {}", fileName);

                // WebP 변환 후 파일 업로드
                File uploadFile = convertToWebp(image)
                        .orElseThrow(() -> new IllegalArgumentException("File conversion failed"));
                // log.info("Converted image to WebP: {}", uploadFile.getName());

                // S3에 업로드 (PublicRead ACL 적용)
                uploadToS3(uploadFile, fileName);

                // CloudFront URL 생성 (S3 객체 키 각 부분 URL 인코딩)
                String encodedFileName = encodeS3Key(fileName);
                String cloudfrontUrl = "https://" + cloudfrontDomain + "/" + encodedFileName;
                fileUrls.add(cloudfrontUrl);

                // 이미지 메타데이터 가져오기 (변환 후 파일의 크기 사용)
                BufferedImage bufferedImage = ImageIO.read(uploadFile);
                Integer width = null;
                Integer height = null;
                if (bufferedImage != null) {
                    width = bufferedImage.getWidth();
                    height = bufferedImage.getHeight();
                }

                // 데이터베이스에 이미지 정보 저장 (url 필드에 CloudFront URL 저장)
                AdminImage adminImageEntity = AdminImage.builder()
                        .fileName(image.getOriginalFilename())
                        .url(cloudfrontUrl)
                        .category(category)
                        .createdAt(LocalDateTime.now())
                        .user(userPrincipal != null ? userPrincipal.getUser() : null)
                        .s3Key(fileName)
                        .build();

                imageRepository.save(adminImageEntity);

                // 업로드 후 임시 파일 삭제
                removeNewFile(uploadFile);
            }

            // log.info("All images uploaded successfully. Total images: {}",
            // images.size());
            return new ImageResponse("Images uploaded successfully");
        } catch (IOException e) {
            log.error("I/O Error while processing image upload", e);
            return new ImageResponse("Failed to process image due to an I/O error");
        } catch (AmazonServiceException e) {
            log.error("Amazon S3 Service Error during image upload", e);
            return new ImageResponse("Failed to upload image to S3");
        } catch (Exception e) {
            log.error("Unexpected error during image upload", e);
            return new ImageResponse("Unexpected error occurred");
        }
    }

    // 파일명 생성 및 WebP 확장자 적용
    private String generateFileName(MultipartFile image, Category category) {
        String originalFileName = image.getOriginalFilename();
        String webpFileName = originalFileName.replaceFirst("[.][^.]+$", "") + ".webp";
        String fileName = "images/" + category.name() + "/" + webpFileName;
        // log.info("Generated file name: {}", fileName);
        return fileName;
    }

    // S3에 파일 업로드 (PublicRead ACL 적용)
    private String uploadToS3(File uploadFile, String fileName) {
        try {
            // log.info("Uploading file to S3 with file name: {}", fileName);
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, fileName, uploadFile);
            amazonS3Client.putObject(putObjectRequest);
            String fileUrl = amazonS3Client.getUrl(bucketName, fileName).toString();
            // log.info("File uploaded successfully to S3. URL: {}", fileUrl);
            return fileUrl;
        } catch (Exception e) {
            log.error("Error uploading file to S3: {}", fileName, e);
            throw new RuntimeException("Error uploading file to S3", e);
        }
    }

    // 임시 파일 삭제
    private void removeNewFile(File targetFile) {
        if (targetFile.delete()) {
            // log.info("{} file deleted successfully", targetFile.getName());
        } else {
            // log.warn("{} file deletion failed", targetFile.getName());
        }
    }

    // WebP 변환
    public Optional<File> convertToWebp(MultipartFile multipartFile) throws IOException {
        File tempFile = convertMultipartFileToFile(multipartFile);
        try {
            String webpFileName = multipartFile.getOriginalFilename().replaceFirst("[.][^.]+$", "") + ".webp";
            File webpFile = new File(tempFile.getParent(), webpFileName);

            // WebP 변환 (손실 압축)
            // log.info("Starting WebP conversion for file: {}", tempFile.getName());
            ImmutableImage.loader()
                    .fromFile(tempFile)
                    .output(WebpWriter.DEFAULT, webpFile);

            return Optional.of(webpFile);
        } catch (IOException e) {
            log.error("Error converting file to WebP", e);
            return Optional.empty();
        }
    }

    // MultipartFile을 File로 변환
    private File convertMultipartFileToFile(MultipartFile multipartFile) throws IOException {
        Path tempPath = Files.createTempFile("temp", multipartFile.getOriginalFilename());
        File tempFile = tempPath.toFile();
        multipartFile.transferTo(tempFile);
        // log.info("Temporary file created: {}", tempFile.getAbsolutePath());
        return tempFile;
    }

    // S3 객체 키(파일 경로) 내 각 부분을 URL 인코딩 (슬래시("/")는 그대로 유지)
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
}
