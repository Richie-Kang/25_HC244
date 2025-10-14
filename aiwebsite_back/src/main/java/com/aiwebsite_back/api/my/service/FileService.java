package com.aiwebsite_back.api.my.service;

import com.aiwebsite_back.api.my.MediaFile;
import com.aiwebsite_back.api.my.Folder;
import com.aiwebsite_back.api.my.repository.FolderRepository;
import com.aiwebsite_back.api.my.repository.MediaFileRepository;
import com.aiwebsite_back.api.my.response.FileResponse;
import com.aiwebsite_back.api.config.UserPrincipal;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final AmazonS3 amazonS3;
    private final FolderRepository folderRepository;
    private final MediaFileRepository mediaFileRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    @Value("${cloud.aws.cloudfront.distribution-domain}")
    private String cloudfrontDomain;

    @Transactional
    public FileResponse uploadFile(MultipartFile file, Long folderId, UserPrincipal userPrincipal) throws IOException {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        if (folder.getUser() == null || !folder.getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new IllegalStateException("파일을 업로드할 권한이 없습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getExtension(originalFilename);
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        String s3Key = folder.getPath() + "/" + uniqueFileName;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());
        if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
            metadata.setCacheControl("max-age=31536000");
        }

        try (InputStream inputStream = file.getInputStream()) {
            PutObjectRequest putReq = new PutObjectRequest(bucketName, s3Key, inputStream, metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead);
            amazonS3.putObject(putReq);
        }

        String encodedKey = encodeS3Key(s3Key);
        String fileUrl = "https://" + cloudfrontDomain + "/" + encodedKey;

        MediaFile mediaFile = new MediaFile();
        mediaFile.setFileName(originalFilename);
        mediaFile.setFileUrl(fileUrl);
        mediaFile.setFolder(folder);
        mediaFile = mediaFileRepository.save(mediaFile);

        FileResponse response = new FileResponse();
        response.setId(mediaFile.getId());
        response.setName(mediaFile.getFileName());
        response.setUrl(mediaFile.getFileUrl());
        return response;
    }

    public List<FileResponse> getFilesByFolder(Long folderId, UserPrincipal userPrincipal) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        if (folder.getUser() == null || !folder.getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new IllegalStateException("파일 목록을 조회할 권한이 없습니다.");
        }

        return folder.getMediaFiles().stream()
                .map(mediaFile -> {
                    FileResponse resp = new FileResponse();
                    resp.setId(mediaFile.getId());
                    resp.setName(mediaFile.getFileName());
                    resp.setUrl(mediaFile.getFileUrl());
                    return resp;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteFile(Long fileId, UserPrincipal userPrincipal) {
        MediaFile mediaFile = mediaFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("파일을 찾을 수 없습니다."));

        // 권한 확인
        if (mediaFile.getFolder() == null ||
                mediaFile.getFolder().getUser() == null ||
                !mediaFile.getFolder().getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new IllegalStateException("파일을 삭제할 권한이 없습니다.");
        }

        // S3에서 파일 삭제 - URL에서 S3 키 추출
        String fileUrl = mediaFile.getFileUrl();
        if (fileUrl.startsWith("https://" + cloudfrontDomain + "/")) {
            String s3Key = fileUrl.replace("https://" + cloudfrontDomain + "/", "");
            s3Key = URLDecoder.decode(s3Key, StandardCharsets.UTF_8);
            amazonS3.deleteObject(bucketName, s3Key);
        }

        // DB에서 파일 정보 삭제
        mediaFileRepository.delete(mediaFile);
    }

    @Transactional
    public FileResponse saveImageFromUrl(String imageUrl, Long folderId, UserPrincipal userPrincipal)
            throws IOException {
        // log.info("saveImageFromUrl 시작 - URL: {}, 폴더 ID: {}, 사용자: {}",
        URI uri = URI.create(imageUrl);
        if (!"https".equalsIgnoreCase(uri.getScheme()) || uri.getHost() == null)
            throw new IllegalArgumentException("올바른 HTTPS URL이 아닙니다.");

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found"));

        if (!folder.getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new IllegalStateException("파일을 업로드할 권한이 없습니다.");
        }

        URL url = uri.toURL();
        String fileName = getFileNameFromUrl(imageUrl);
        String extension = getExtension(fileName);
        String uniqueFileName = UUID.randomUUID().toString() + extension;
        String s3Key = folder.getPath() + "/" + uniqueFileName;

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(10000);
        connection.setRequestProperty("User-Agent", "Mozilla/5.0");
        connection.connect();

        int responseCode = connection.getResponseCode();
        if (responseCode != HttpURLConnection.HTTP_OK) {
            throw new IOException("이미지를 다운로드할 수 없습니다. 응답 코드: " + responseCode);
        }

        String contentType = connection.getContentType();
        int contentLength = connection.getContentLength();

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(contentType);
        if (contentLength > 0) {
            metadata.setContentLength(contentLength);
        }
        if (contentType != null && contentType.startsWith("image/")) {
            metadata.setCacheControl("max-age=31536000");
        }

        try (InputStream inputStream = connection.getInputStream()) {
            PutObjectRequest putReq = new PutObjectRequest(bucketName, s3Key, inputStream, metadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead);
            amazonS3.putObject(putReq);
        }

        String encodedKey = encodeS3Key(s3Key);
        String fileUrl = "https://" + cloudfrontDomain + "/" + encodedKey;

        MediaFile mediaFile = new MediaFile();
        mediaFile.setFileName(fileName);
        mediaFile.setFileUrl(fileUrl);
        mediaFile.setFolder(folder);
        mediaFile = mediaFileRepository.save(mediaFile);

        FileResponse response = new FileResponse();
        response.setId(mediaFile.getId());
        response.setName(mediaFile.getFileName());
        response.setUrl(mediaFile.getFileUrl());

        connection.disconnect();
        return response;
    }

    private String getFileNameFromUrl(String url) {
        String[] segments = url.split("/");
        String last = segments[segments.length - 1];
        int qi = last.indexOf('?');
        if (qi > 0) {
            last = last.substring(0, qi);
        }
        return last.isEmpty() ? "image" + UUID.randomUUID() : last;
    }

    private String getExtension(String filename) {
        if (filename == null)
            return "";
        int idx = filename.lastIndexOf('.');
        return (idx < 0) ? "" : filename.substring(idx);
    }

    private String encodeS3Key(String key) {
        String[] parts = key.split("/");
        return java.util.Arrays.stream(parts)
                .map(p -> URLEncoder.encode(p, StandardCharsets.UTF_8))
                .collect(Collectors.joining("/"));
    }


}
