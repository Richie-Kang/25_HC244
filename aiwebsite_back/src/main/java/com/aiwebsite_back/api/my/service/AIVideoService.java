package com.aiwebsite_back.api.my.service;

import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.my.AIVideo;
import com.aiwebsite_back.api.my.repository.AIVideoRepository;
import com.aiwebsite_back.api.my.repository.LikeVideoRepository;
import com.aiwebsite_back.api.my.request.AIVideoRequest;
import com.aiwebsite_back.api.my.response.AIVideoResponse;
import com.aiwebsite_back.api.user.User;
import com.aiwebsite_back.api.user.repository.UserRepository;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Frame;
import org.bytedeco.javacv.Java2DFrameConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.awt.image.BufferedImage;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIVideoService {

    private final AIVideoRepository aiVideoRepository;
    private final LikeVideoRepository likeVideoRepository;
    private final AmazonS3Client amazonS3Client;
    private final UserRepository userRepository;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.cloudfront.distribution-domain}")
    private String cloudfrontDomain;

    /*
     * =====================================================================
     * saveVideo – Multipart OR URL 모두 처리
     * ---------------------------------------------------------------------
     */
    public AIVideoResponse saveVideo(AIVideoRequest request,
            MultipartFile videoFile,
            MultipartFile referenceFile,
            UserPrincipal userPrincipal) throws IOException {

        /*
         * ------------------------------------------------------------
         * 1. 입력 소스 결정 (Multipart vs URL)
         * ------------------------------------------------------------
         */
        Path tempFile; // 처리 대상 임시 파일
        String originalFilename; // 사용자가 올린 파일명 또는 URL 파일명
        String extension; // ".mp4" 등
        long fileSize; // 바이트
        String contentType; // 추정 MIME
        boolean createdByDownload = false;

        if (videoFile != null && !videoFile.isEmpty()) { // ── Multipart 업로드
            originalFilename = videoFile.getOriginalFilename();
            extension = getFileExtension(originalFilename);
            contentType = videoFile.getContentType();
            tempFile = Files.createTempFile("video-", extension);
            videoFile.transferTo(tempFile);
            fileSize = videoFile.getSize();
            // log.info("[Multipart] 비디오 임시 파일 생성: {}", tempFile);

        } else if (StringUtils.hasText(request.getVideoUrl())) { // ── URL 업로드
            URL url = new URL(request.getVideoUrl());
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            con.connect();
            if (con.getResponseCode() != HttpURLConnection.HTTP_OK) {
                throw new IOException("비디오 다운로드 실패 – HTTP " + con.getResponseCode());
            }

            contentType = con.getContentType(); // e.g. "video/mp4"
            extension = guessExtension(url.getPath(), contentType); // ".mp4" fallback
            originalFilename = Paths.get(url.getPath()).getFileName().toString(); // URL 끝부분

            tempFile = Files.createTempFile("video-url-", extension);
            try (InputStream in = con.getInputStream()) {
                Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
            }
            fileSize = Files.size(tempFile);
            createdByDownload = true;
            // log.info("[URL] 비디오 다운로드 완료: {} ({} bytes)", tempFile, fileSize);

        } else {
            throw new IllegalArgumentException("videoFile 또는 videoUrl 중 하나는 반드시 제공해야 합니다.");
        }

        /*
         * ------------------------------------------------------------
         * 2. 비디오 길이 계산 & S3 Key 생성
         * ------------------------------------------------------------
         */
        Integer duration = extractVideoDuration(tempFile.toFile());

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String userEmail = userPrincipal.getUser().getEmail();
        String modeFolder = (request.getMode() != null)
                ? request.getMode().toString().toLowerCase()
                : "unknown";

        String s3Key = "videos/" + userEmail + "/" + modeFolder + "/"
                + UUID.randomUUID() + "-" + timestamp + extension;

        /*
         * ------------------------------------------------------------
         * 3. 비디오 파일 S3 업로드
         * ------------------------------------------------------------
         */
        ObjectMetadata meta = new ObjectMetadata();
        meta.setContentLength(fileSize);
        meta.setContentType(contentType != null ? contentType : "video/mp4");

        try (InputStream fis = Files.newInputStream(tempFile)) {
            amazonS3Client.putObject(
                    new PutObjectRequest(bucket, s3Key, fis, meta));
        }

        /*
         * ------------------------------------------------------------
         * 4. 썸네일 (레퍼런스 or 자동 생성)
         * ------------------------------------------------------------
         */
        String thumbnailS3Key;
        String thumbnailUrl = null;

        if (referenceFile != null && !referenceFile.isEmpty()) {
            thumbnailS3Key = uploadReferenceFileDirectly(referenceFile, s3Key);
            thumbnailUrl = "https://" + cloudfrontDomain + "/" + encodeS3Key(thumbnailS3Key);
        } else {
            try {
                thumbnailS3Key = generateAndUploadThumbnail(tempFile.toFile(), s3Key);
                thumbnailUrl = "https://" + cloudfrontDomain + "/" + encodeS3Key(thumbnailS3Key);
            } catch (Exception e) {
                log.error("썸네일 생성 실패 – 계속 진행", e);
            }
        }

        String refFileName = (referenceFile != null && !referenceFile.isEmpty())
                ? referenceFile.getOriginalFilename()
                : null;

        /*
         * ------------------------------------------------------------
         * 5. DB 저장
         * ------------------------------------------------------------
         */
        AIVideo videoEntity = AIVideo.builder()
                .videoName(request.getVideoName())
                .prompt(request.getPrompt())
                .url("https://" + cloudfrontDomain + "/" + s3Key)
                .model(request.getModel())
                .mode(request.getMode())
                .referenceFile(refFileName)
                .share(false)
                .creator(userPrincipal.getUser().getNickname())
                .thumbnailUrl(thumbnailUrl)
                .s3Key(s3Key)
                .format(extension.replace(".", ""))
                .sizeInBytes(fileSize)
                .durationInSeconds(duration)
                .clickCount(0)
                .likeCount(0)
                .build();

        AIVideo saved = aiVideoRepository.save(videoEntity);
        // log.info("영상 저장 완료 – ID={}, type={}, source={}",
        // saved.getId(),
        // saved.getMode(),
        // (createdByDownload ? "URL" : "Multipart"));

        /*
         * ------------------------------------------------------------
         * 6. 임시 파일 삭제
         * ------------------------------------------------------------
         */
        Files.deleteIfExists(tempFile);

        return AIVideoResponse.fromEntity(saved);
    }

    /*
     * =====================================================================
     * ▼ 썸네일/업로드/유틸 메서드 – (기존 로직 그대로)
     * ===================================================================
     */
    private String uploadReferenceFileDirectly(MultipartFile file, String videoS3Key) throws IOException {
        String extension = getFileExtension(file.getOriginalFilename());
        String baseKey = videoS3Key.substring(0, videoS3Key.lastIndexOf('.'));
        String referenceKey = baseKey + "-ref" + extension;

        ObjectMetadata md = new ObjectMetadata();
        md.setContentLength(file.getSize());
        md.setContentType(file.getContentType());

        amazonS3Client.putObject(
                new PutObjectRequest(bucket, referenceKey, file.getInputStream(), md));
        return referenceKey;
    }

    private String generateAndUploadThumbnail(File videoFile, String videoS3Key) {
        FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(videoFile);
        BufferedImage img;

        try {
            grabber.start();
            grabber.setTimestamp(1_000_000); // 1초
            Frame frame = grabber.grabImage();
            if (frame == null || frame.image == null) {
                grabber.setFrameNumber(Math.max(1, (int) grabber.getFrameRate()));
                frame = grabber.grabImage();
            }
            img = new Java2DFrameConverter().convert(frame);
        } catch (Exception e) {
            throw new RuntimeException("프레임 추출 실패", e);
        } finally {
            try {
                grabber.stop();
                grabber.release();
            } catch (Exception ignored) {
            }
        }

        if (img == null)
            throw new RuntimeException("유효한 썸네일 프레임을 찾을 수 없습니다.");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            Thumbnails.of(img)
                    .size(1280, 720)
                    .outputFormat("jpg")
                    .outputQuality(0.95)
                    .toOutputStream(baos);
        } catch (IOException e) {
            throw new RuntimeException("Thumbnailator 실패", e);
        }

        String thumbKey = videoS3Key.substring(0, videoS3Key.lastIndexOf('.')) + "-thumbnail.jpg";
        ObjectMetadata md = new ObjectMetadata();
        md.setContentLength(baos.size());
        md.setContentType("image/jpeg");

        amazonS3Client.putObject(
                new PutObjectRequest(bucket, thumbKey,
                        new ByteArrayInputStream(baos.toByteArray()), md));

        return thumbKey;
    }

    private Integer extractVideoDuration(File file) {
        try (FFmpegFrameGrabber g = new FFmpegFrameGrabber(file)) {
            g.start();
            return (int) (g.getLengthInTime() / 1_000_000);
        } catch (Exception e) {
            log.warn("비디오 길이 추출 실패", e);
            return null;
        }
    }

    private String encodeS3Key(String key) {
        StringBuilder sb = new StringBuilder();
        String[] parts = key.split("/");
        for (int i = 0; i < parts.length; i++) {
            sb.append(URLEncoder.encode(parts[i], StandardCharsets.UTF_8));
            if (i < parts.length - 1)
                sb.append("/");
        }
        return sb.toString();
    }

    private String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains("."))
            return "";
        return filename.substring(filename.lastIndexOf('.'));
    }

    /** URL 경로·Content‑Type로 확장자 추정 */
    private String guessExtension(String path, String contentType) {
        String ext = getFileExtension(path);
        if (StringUtils.hasText(ext))
            return ext;

        if (contentType != null) {
            if (contentType.contains("mp4"))
                return ".mp4";
            if (contentType.contains("webm"))
                return ".webm";
            if (contentType.contains("quicktime"))
                return ".mov";
        }
        return ".mp4"; // 기본값
    }

    /*
     * =====================================================================
     * ▼ 조회/공유/좋아요 로직 (변경 없음)
     * ===================================================================
     */
    public List<AIVideoResponse> getUserVideos(String username) {
        return aiVideoRepository.findAllByCreator(username).stream()
                .map(AIVideoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public AIVideoResponse updateShareStatus(Long id, boolean share, String user) {
        AIVideo v = aiVideoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "비디오를 찾을 수 없습니다"));
        if (!v.getCreator().equals(user))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "소유자만 변경 가능합니다");

        v.setShare(share);
        return AIVideoResponse.fromEntity(aiVideoRepository.save(v));
    }

    public List<AIVideoResponse> getUserVideosByType(String user, AIVideo.VideoType type) {
        return aiVideoRepository.findAllByCreatorAndMode(user, type).stream()
                .map(AIVideoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public AIVideoResponse getVideoById(Long id, String user) {
        AIVideo v = aiVideoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "비디오를 찾을 수 없습니다"));
        if (!v.getCreator().equals(user) && !v.isShare())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "접근 권한이 없습니다");

        boolean liked = likeVideoRepository.existsByVideoAndEmail(v, user);
        v.setClickCount(v.getClickCount() + 1);
        aiVideoRepository.save(v);

        return AIVideoResponse.fromEntity(v, liked);
    }

    public AIVideoResponse saveVideoWithReferences(
            AIVideoRequest request,
            MultipartFile videoFile,
            MultipartFile referenceFile,
            UserPrincipal userPrincipal) throws IOException {

        // userId 확인
        String userId = request.getUserId();
        if (StringUtils.hasText(userId)) {
            // userId로 사용자 정보 조회
            User user = userRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "사용자 ID " + userId + "를 찾을 수 없습니다"));

            // UserPrincipal 생성 (기존 로직 활용)
            UserPrincipal principal = new UserPrincipal(user);

            // 나머지 로직은 기존과 동일하게 처리
            return saveVideo(request, videoFile, referenceFile, principal);
        } else {
            // userId가 없는 경우 기존 로직대로 처리
            return saveVideo(request, videoFile, referenceFile, userPrincipal);
        }

        // 레퍼런스 URL 처리 및 임시 파일 정리 코드는 saveVideo에 위임
    }

    public AIVideoResponse updateVideoName(Long id, String newName, String user) {
        AIVideo v = aiVideoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "비디오를 찾을 수 없습니다"));

        if (!v.getCreator().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "소유자만 이름을 변경할 수 있습니다");
        }

        v.setVideoName(newName);
        return AIVideoResponse.fromEntity(aiVideoRepository.save(v));
    }
}
