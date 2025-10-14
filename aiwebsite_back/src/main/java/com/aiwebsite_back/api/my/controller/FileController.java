package com.aiwebsite_back.api.my.controller;

import com.aiwebsite_back.api.my.request.FashnImageUrlRequest;
import com.aiwebsite_back.api.my.request.UpscaleImageUrlRequest;
import com.aiwebsite_back.api.my.response.FileResponse;
import com.aiwebsite_back.api.my.service.FileService;
import com.aiwebsite_back.api.config.UserPrincipal;
import com.aiwebsite_back.api.my.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.List;
import java.util.Arrays;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Validated
public class FileController {

        private final FileService fileService;
        private final FolderRepository folderRepository;

        @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<FileResponse> uploadImage(
                        @AuthenticationPrincipal UserPrincipal userPrincipal,
                        @RequestParam("image") MultipartFile image) throws IOException {
                if (!isImageFile(image)) {
                        return ResponseEntity.badRequest().build();
                }

                var uploadFolder = folderRepository
                                .findByUserIdAndName(userPrincipal.getUser().getId(), "upload")
                                .orElseThrow(() -> {
                                        log.error("uploadImage - Upload folder not found for user: {}",
                                                        userPrincipal.getUser().getId());
                                        return new IllegalStateException("Upload 폴더를 찾을 수 없습니다.");
                                });

                FileResponse response = fileService.uploadFile(image, uploadFolder.getId(), userPrincipal);
                return ResponseEntity.ok(response);
        }

        @PostMapping(value = "/upload/upscaler", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<FileResponse> upscaleImageUpload(
                @AuthenticationPrincipal UserPrincipal userPrincipal,
                @Valid @RequestBody UpscaleImageUrlRequest request) {

                // "upscaler" 폴더 조회
                var upscalerFolder = folderRepository
                        .findByUserIdAndName(userPrincipal.getUser().getId(), "upscaler")
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Upscaler 폴더를 찾을 수 없습니다."));

                try {
                        FileResponse response = fileService.saveImageFromUrl(
                                request.getImageUrl(),
                                upscalerFolder.getId(),
                                userPrincipal);
                        return ResponseEntity.ok(response);

                } catch (MalformedURLException e) {
                        log.error("잘못된 URL 형식: {}", request.getImageUrl(), e);
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "올바른 URL 형식이 아닙니다.");

                } catch (IOException e) {
                        log.error("IO 오류 발생", e);
                        throw new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "이미지 업로드 중 서버 오류가 발생했습니다.");

                } catch (IllegalArgumentException | IllegalStateException e) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                e.getMessage());

                } catch (Exception e) {
                        log.error("예기치 못한 오류", e);
                        throw new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "이미지 업로드 중 오류가 발생했습니다.");
                }
        }

        @PostMapping(value = "/upload/fashn", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<FileResponse> fashnImageUpload(
                        @AuthenticationPrincipal UserPrincipal userPrincipal,
                        @Valid @RequestBody FashnImageUrlRequest request) {
                // log.info("▶︎ fashnImageUpload 시작 - userId={}, imageUrl={}",
                // userPrincipal.getUser().getId(), request.getImageUrl());

                // "fashn" 폴더 조회
                var fashnFolder = folderRepository
                                .findByUserIdAndName(userPrincipal.getUser().getId(), "fashn")
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "Fashn 폴더를 찾을 수 없습니다."));

                try {
                        FileResponse response = fileService.saveImageFromUrl(
                                        request.getImageUrl(),
                                        fashnFolder.getId(),
                                        userPrincipal);
                        // log.info("▶︎ 이미지 업로드 성공 - fileId={}, name={}",
                        // response.getId(), response.getName());
                        return ResponseEntity.ok(response);

                } catch (MalformedURLException e) {
                        log.error("▶︎ 잘못된 URL 형식: {}", request.getImageUrl(), e);
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "올바른 URL 형식이 아닙니다.");

                } catch (IOException e) {
                        log.error("▶︎ IO 오류 발생", e);
                        throw new ResponseStatusException(
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        "이미지 업로드 중 서버 오류가 발생했습니다.");

                } catch (IllegalArgumentException | IllegalStateException e) {
                        // 빈 URL 이거나 권한/폴더 문제
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        e.getMessage());

                } catch (Exception e) {
                        log.error("▶︎ 예기치 못한 오류", e);
                        throw new ResponseStatusException(
                                        HttpStatus.INTERNAL_SERVER_ERROR,
                                        "이미지 업로드 중 오류가 발생했습니다.");
                }
        }

        @PostMapping("/upload/{folderId}")
        public ResponseEntity<FileResponse> uploadFile(
                        @AuthenticationPrincipal UserPrincipal userPrincipal,
                        @PathVariable Long folderId,
                        @RequestParam("file") MultipartFile file) throws IOException {
                FileResponse response = fileService.uploadFile(file, folderId, userPrincipal);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/folder/{folderId}")
        public ResponseEntity<List<FileResponse>> getFilesByFolder(
                        @AuthenticationPrincipal UserPrincipal userPrincipal,
                        @PathVariable Long folderId) {
                // log.info("getFilesByFolder - folderId={}", folderId);
                List<FileResponse> files = fileService.getFilesByFolder(folderId, userPrincipal);
                return ResponseEntity.ok(files);
        }

        private boolean isImageFile(MultipartFile file) {
                String contentType = file.getContentType();
                if (contentType == null)
                        return false;

                List<String> imageTypes = Arrays.asList(
                                "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp");
                return imageTypes.contains(contentType.toLowerCase());
        }

        @DeleteMapping("/{fileId}")
        public ResponseEntity<Void> deleteFile(
                @AuthenticationPrincipal UserPrincipal userPrincipal,
                @PathVariable Long fileId) {
                try {
                        fileService.deleteFile(fileId, userPrincipal);
                        return ResponseEntity.noContent().build();
                } catch (IllegalArgumentException e) {
                        throw new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                e.getMessage());
                } catch (IllegalStateException e) {
                        throw new ResponseStatusException(
                                HttpStatus.FORBIDDEN,
                                e.getMessage());
                } catch (Exception e) {
                        log.error("파일 삭제 중 오류 발생", e);
                        throw new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "파일 삭제 중 오류가 발생했습니다.");
                }
        }
}
