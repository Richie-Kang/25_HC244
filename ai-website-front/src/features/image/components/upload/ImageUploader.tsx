"use client";
import React, { useState } from "react";
import { uploadImages } from "../../services/ImageService"; // ImageService 가져오기
import { ImageItem } from "../../types/Image"; // 타입 가져오기

const ImageUploader = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [category, setCategory] = useState("");
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
    const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]); // 업로드 결과 저장
    const [error, setError] = useState<string | null>(null); // 오류 메시지

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files); // 여러 파일을 배열로 변환
            setFiles(selectedFiles);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };

    const handleUpload = async () => {
        if (files.length === 0 || !category) {
            alert("파일과 카테고리를 선택해주세요.");
            return;
        }

        setIsLoading(true); // 로딩 상태 시작
        setError(null); // 오류 초기화

        try {
            // 로그 추가
            console.log("파일 업로드 요청 보내기:", {
                files: files.map((file) => file.name),
                category: category,
            });

            // ImageService의 uploadImages 함수 사용
            const response = await uploadImages(files, category);

            // 업로드 성공 시
            setUploadedImages(response.data); // 업로드된 이미지 정보 저장
            alert("이미지 업로드 성공");

            // 폼 초기화
            setFiles([]);
            setCategory("");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "이미지 업로드 중 오류가 발생했습니다"
            );
            console.error("업로드 중 에러 발생:", error);
            alert(
                "업로드 실패: " +
                (error instanceof Error ? error.message : "알 수 없는 오류")
            );
        } finally {
            setIsLoading(false); // 로딩 상태 종료
        }
    };

    return (
        <div className="border border-white/20 p-4 rounded relative bg-black/40 backdrop-blur-xl">
            {/* 로딩 팝업 */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-black/40 backdrop-blur-xl p-6 rounded-lg border border-white/20">
                        <p className="text-center text-lg font-semibold text-white">업로드 중...</p>
                        <div className="mt-4 flex justify-center">
                            <div className="loader w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* 파일 입력 및 카테고리 선택 */}
            <div className="mb-4">
                <p className="font-medium text-white mb-2">이미지 파일 선택</p>
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple // 여러 파일 선택 가능
                    className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-500/20 file:text-sky-500 hover:file:bg-sky-500/30"
                    accept="image/*"
                />
                {files.length > 0 && (
                    <p className="mt-2 text-sm text-gray-400">
                        {files.length}개 파일 선택됨
                    </p>
                )}
            </div>

            <div className="mb-4">
                <p className="font-medium text-white mb-2">카테고리 선택</p>
                <select
                    value={category}
                    onChange={handleCategoryChange}
                    className="block w-full px-4 py-2 bg-black/40 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
                >
                    <option value="">카테고리를 선택하세요</option>
                    <option value="REALITY">AI 현실적 이미지</option>
                    <option value="ILLUSTRATION">AI 일러스트 이미지</option>
                    <option value="VIDEO">AI 영상</option>
                    <option value="ETC">기타</option>
                </select>
            </div>

            {/* 오류 메시지 표시 */}
            {error && (
                <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-md border border-red-500/20">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={isLoading || files.length === 0 || !category}
                className="w-full px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:bg-gray-500/50 disabled:cursor-not-allowed"
            >
                {isLoading ? "업로드 중..." : "업로드"}
            </button>

            {/* 업로드 성공 시 결과 표시 */}
            {uploadedImages && uploadedImages.length > 0 && (
                <div className="mt-4">
                    <p className="font-medium text-sky-500 mb-2">
                        업로드 완료! ({uploadedImages.length}개)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {uploadedImages.map((img, index) => (
                            <div key={img?.id || index} className="border border-white/20 rounded-md p-2 bg-black/40 backdrop-blur-xl">
                                {img?.url && (
                                    <img
                                        src={img.url}
                                        alt={img.fileName || "이미지"}
                                        className="w-full h-32 object-cover rounded-md"
                                    />
                                )}
                                <p className="text-xs mt-1 text-gray-300 truncate">
                                    {img?.fileName || "파일명 없음"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
