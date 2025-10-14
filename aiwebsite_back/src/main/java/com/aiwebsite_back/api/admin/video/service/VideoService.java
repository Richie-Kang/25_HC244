package com.aiwebsite_back.api.admin.video.service;

import com.aiwebsite_back.api.admin.video.Video;
import com.aiwebsite_back.api.admin.video.repository.VideoRepository;
import com.aiwebsite_back.api.admin.video.request.VideoRequest;
import com.aiwebsite_back.api.admin.video.response.VideoResponse;
import com.aiwebsite_back.api.config.UserPrincipal;
import com.amazonaws.AmazonServiceException;
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
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VideoService {

    private final VideoRepository videoRepository;
    private final AmazonS3Client amazonS3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.cloudfront.distribution-domain}")
    private String cloudfrontDomain;

    public VideoResponse uploadVideo(VideoRequest request, MultipartFile aiVideo,
            MultipartFile modeFile, Video.VideoType videoType, UserPrincipal userPrincipal) throws IOException {
        // Process AIVideo (required file)
        String fileExtension = getFileExtension(aiVideo.getOriginalFilename());
        // log.info("AIVideo 파일 확장자 추출: {}", fileExtension);

        Path tempFilePath = Files.createTempFile("video", fileExtension);
        // log.info("임시 파일 생성: {}", tempFilePath.toAbsolutePath());
        aiVideo.transferTo(tempFilePath.toFile());

        // Extract metadata
        File videoFile = tempFilePath.toFile();
        long fileSize = Files.size(tempFilePath);
        Integer durationInSeconds = extractVideoDuration(videoFile);

        // Upload AIVideo to S3
        String videoS3Key = "AdminVideos/" + UUID.randomUUID() + fileExtension;
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(fileSize);
        metadata.setContentType(aiVideo.getContentType());

        try (FileInputStream fis = new FileInputStream(videoFile)) {
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucket, videoS3Key, fis, metadata);
            amazonS3Client.putObject(putObjectRequest);
        }

        // Generate CloudFront URL for video
        String encodedVideoS3Key = encodeS3Key(videoS3Key);
        String videoUrl = "https://" + cloudfrontDomain + "/" + encodedVideoS3Key;
        // log.info("CloudFront URL: {}", videoUrl);

        // Generate thumbnail
        String thumbnailS3Key = null;
        String thumbnailUrl = null;
        try {
            thumbnailS3Key = generateAndUploadThumbnail(videoFile, videoS3Key);
            String encodedThumbnailS3Key = encodeS3Key(thumbnailS3Key);
            thumbnailUrl = "https://" + cloudfrontDomain + "/" + encodedThumbnailS3Key;
        } catch (Exception e) {
            // log.error("썸네일 생성 실패: {}", e.getMessage(), e);
        }

        // Clean up temp file
        Files.deleteIfExists(tempFilePath);

        // Process modeFile if present
        String modeFileUrl = null;
        if (modeFile != null) {
            String modeFileExtension = getFileExtension(modeFile.getOriginalFilename());
            Path modeFileTempPath = Files.createTempFile("modefile", modeFileExtension);
            modeFile.transferTo(modeFileTempPath.toFile());

            String modeFileS3Key = "AdminVideos/modeFiles/" + UUID.randomUUID() + modeFileExtension;

            // Upload modeFile to S3
            ObjectMetadata modeFileMetadata = new ObjectMetadata();
            long modeFileSize = Files.size(modeFileTempPath);
            modeFileMetadata.setContentLength(modeFileSize);
            modeFileMetadata.setContentType(modeFile.getContentType());

            try (FileInputStream fis = new FileInputStream(modeFileTempPath.toFile())) {
                PutObjectRequest putObjectRequest = new PutObjectRequest(bucket, modeFileS3Key, fis, modeFileMetadata)
                        .withCannedAcl(CannedAccessControlList.PublicRead);
                amazonS3Client.putObject(putObjectRequest);
            }

            String encodedModeFileS3Key = encodeS3Key(modeFileS3Key);
            modeFileUrl = "https://" + cloudfrontDomain + "/" + encodedModeFileS3Key;
            // log.info("ModeFile CloudFront URL: {}", modeFileUrl);

            Files.deleteIfExists(modeFileTempPath);
        }

        // Create and save Video entity
        Video video = Video.builder()
                .name(request.getName())
                .prompt(request.getPrompt())
                .url(videoUrl)
                .s3Key(videoS3Key)
                .format(fileExtension.substring(1))
                .sizeInBytes(fileSize)
                .durationInSeconds(videoType == Video.VideoType.VIDEO ? durationInSeconds : null)
                .model(request.getModel())
                .thumbnailUrl(thumbnailUrl)
                .mode(videoType)
                .referenceFile(modeFileUrl)
                .share(false)
                .creator(userPrincipal.getUser().getEmail())
                .clickCount(0)
                .likeCount(0)
                .build();

        video = videoRepository.save(video);
        return VideoResponse.fromEntity(video);
    }

    private String generateAndUploadThumbnail(File videoFile, String videoS3Key) {
        FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(videoFile);
        BufferedImage bufferedImage = null;
        try {
            // log.info("FFmpegFrameGrabber 시작");
            grabber.start();

            // 비디오 정보 로그
            // log.info("비디오 정보: 총 프레임 수: {}, 길이: {}초, FPS: {}",
            // grabber.getLengthInFrames(),
            // grabber.getLengthInTime() / 1_000_000.0,
            // grabber.getFrameRate());

            // 우선 1초 지점에서 프레임 추출 시도
            grabber.setTimestamp(1_000_000); // 1초
            // log.info("1초 지점의 프레임 추출 시도");
            Frame frame = grabber.grabImage();
            if (frame != null && frame.image != null) {
                // log.info("1초 지점에서 프레임 추출 성공");
                Java2DFrameConverter converter = new Java2DFrameConverter();
                bufferedImage = converter.convert(frame);
            } else {
                // 1초 지점 실패 시, 프레임 번호로 재시도
                int frameAt1Second = Math.max(1, (int) grabber.getFrameRate());
                // log.info("프레임 번호 {}에서 프레임 추출 시도", frameAt1Second);
                grabber.setFrameNumber(frameAt1Second);
                frame = grabber.grabImage();
                if (frame != null && frame.image != null) {
                    // log.info("프레임 번호 {}에서 프레임 추출 성공", frameAt1Second);
                    Java2DFrameConverter converter = new Java2DFrameConverter();
                    bufferedImage = converter.convert(frame);
                } else {
                    // 최후의 수단: 첫 번째 프레임 시도
                    // log.warn("1초 지점에서 프레임 추출 실패, 첫 번째 프레임으로 재시도");
                    grabber.setFrameNumber(0);
                    frame = grabber.grabImage();
                    if (frame != null && frame.image != null) {
                        // log.info("첫 번째 프레임 추출 성공");
                        Java2DFrameConverter converter = new Java2DFrameConverter();
                        bufferedImage = converter.convert(frame);
                    } else {
                        // log.error("프레임 추출 실패: {}", videoFile.getAbsolutePath());
                        throw new RuntimeException("프레임을 추출할 수 없습니다. 동영상 파일을 확인하세요: " + videoFile.getAbsolutePath());
                    }
                }
            }
        } catch (Exception e) {
            // log.error("프레임 추출 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("Error extracting frame: " + e.getMessage(), e);
        } finally {
            try {
                grabber.stop();
                grabber.release();
                // log.info("FFmpegFrameGrabber 자원 해제 완료");
            } catch (Exception e) {
                // log.error("FFmpegFrameGrabber 자원 해제 실패", e);
            }
        }

        if (bufferedImage == null || bufferedImage.getWidth() <= 0 || bufferedImage.getHeight() <= 0) {
            throw new RuntimeException("유효한 이미지를 추출할 수 없습니다: " + videoFile.getAbsolutePath());
        }

        // Thumbnailator로 썸네일 생성 (320x240 크기, outputQuality 85%)
        // log.info("Thumbnailator를 이용한 썸네일 생성 시작");
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            Thumbnails.of(bufferedImage)
                    .size(320, 240)
                    .outputFormat("jpg")
                    .outputQuality(0.85)
                    .toOutputStream(baos);
        } catch (IOException e) {
            // log.error("Thumbnailator를 이용한 썸네일 생성 실패: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating thumbnail with Thumbnailator: " + e.getMessage(), e);
        }
        byte[] imageBytes = baos.toByteArray();
        // log.info("썸네일 이미지 바이트 배열 생성 완료, 크기: {} bytes", imageBytes.length);

        // S3에 업로드할 썸네일 S3 키 생성
        String baseKey = videoS3Key.substring(0, videoS3Key.lastIndexOf("."));
        String thumbnailS3Key = baseKey + "-thumbnail.jpg";
        // log.info("생성된 썸네일 S3 키: {}", thumbnailS3Key);

        // 썸네일 메타데이터 설정 및 S3 업로드 (PublicRead ACL 적용)
        ObjectMetadata thumbMetadata = new ObjectMetadata();
        thumbMetadata.setContentLength(imageBytes.length);
        thumbMetadata.setContentType("image/jpeg");
        // log.info("S3에 썸네일 업로드 시작");
        PutObjectRequest putObjectRequest = new PutObjectRequest(bucket, thumbnailS3Key,
                new ByteArrayInputStream(imageBytes), thumbMetadata);
        amazonS3Client.putObject(putObjectRequest);
        // log.info("S3에 썸네일 업로드 완료");

        return thumbnailS3Key;
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

    // 비디오 길이(초) 추출
    private Integer extractVideoDuration(File videoFile) {
        try (FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(videoFile)) {
            grabber.start();
            return (int) (grabber.getLengthInTime() / 1_000_000);
        } catch (Exception e) {
            // log.warn("비디오 길이 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    public List<VideoResponse> getAllVideos() {
        // log.info("전체 비디오 목록 조회");
        return videoRepository.findAll().stream()
                .map(VideoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public VideoResponse getVideo(Long id) {
        // log.info("비디오 조회, ID: {}", id);
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("비디오를 찾을 수 없습니다: " + id));
        return VideoResponse.fromEntity(video);
    }

    public void deleteVideo(Long id) {

        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("비디오를 찾을 수 없습니다: " + id));

        // 썸네일 삭제
        if (video.getThumbnailUrl() != null) {
            String thumbnailS3Key = video.getThumbnailUrl().replace("https://" + cloudfrontDomain + "/", "");

            amazonS3Client.deleteObject(bucket, thumbnailS3Key);
        }

        amazonS3Client.deleteObject(bucket, video.getS3Key());

        // DB에서 삭제
        videoRepository.delete(video);
    }

    private String getFileExtension(String filename) {
        int idx = filename.lastIndexOf(".");
        if (idx == -1) {
            // log.warn("파일 이름에 확장자가 없습니다: {}", filename);
            return "";
        }
        String extension = filename.substring(idx);
        // log.info("파일 확장자 추출 성공: {}", extension);
        return extension;
    }
}
