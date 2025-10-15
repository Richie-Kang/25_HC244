### 🏷️ Project Name  
**TrynicAI – 제품 사진 한 장으로 완성하는 AI 영상 광고 생성 플랫폼**

---

### 🎯 Background & Problem Definition  
현대 광고 시장은 짧고 임팩트 있는 **숏폼 영상 중심**으로 빠르게 재편되고 있습니다.  
그러나 중소 브랜드나 1인 쇼핑몰은  
- 전문 촬영 장비나 모델 섭외 비용이 높고  
- SNS별 맞춤형 광고 영상을 빠르게 제작하기 어렵습니다.  

> 📌 이러한 문제를 해결하기 위해 **TrynicAI**는 “사진 한 장으로 영상 광고를 자동 생성하는 AI 솔루션”을 제공합니다.

---

### 🧩 Core Objectives  
- 제품 이미지 한 장만으로 **모델 착용·사용 영상 광고 자동 생성**  
- 브랜드별 **스타일·톤앤매너 반영 커스터마이징**  
- **SNS(Instagram, TikTok 등) 맞춤 포맷 자동 변환**  
- 누구나 5분 안에 고품질 광고 영상을 제작할 수 있는 플랫폼 구축  

---

### ⚙️ Key Features

| 구분 | 기능명 | 설명 |
|------|---------|------|
| 🔹 이미지 인식 | 제품 영역 자동 탐지 | 업로드된 제품 이미지에서 물체/인물 자동 분리 |
| 🔹 AI 영상 생성 | 텍스트·이미지 기반 합성 | 제품 사용 장면 및 모델 착용 영상 자동 생성 |
| 🔹 스타일 매칭 | 브랜드별 톤앤매너 적용 | 색상·조명·배경 분위기를 브랜드 스타일에 맞게 합성 |
| 🔹 영상 편집 자동화 | 숏폼 최적화 클립 생성 | SNS별 길이·비율·자막 자동 적용 |
| 🔹 B2B 관리 기능 | 고객별 프로젝트 대시보드 | 생성 영상 관리 및 수정 요청 기능 제공 |

---

### 🛠️ Tech Stack

| 구분 | 기술 |
|------|------|
| **Frontend** | Next.js, TailwindCSS |
| **Backend** | Spring Boot, MySQL |
| **AI Model** | Fal API 기반 Video Generation, YOLOv5 Object Detection |
| **Infra** | AWS S3, CloudFront, EC2 |
| **Tools** | Figma, Notion, Slack, GitHub |

---

### 📈 Vision  
> “이미지 한 장으로 누구나 자신만의 광고 영상을 만드는 세상.”  
> TrynicAI는 **AI 기반 콘텐츠 자동화의 표준 플랫폼**을 목표로 합니다.

## 👥 Team Introduction
![KakaoTalk_20251015_220748822](https://github.com/user-attachments/assets/77e5335f-55ee-43ef-9b14-5b1f017361d3)

| 역할 | 이름 | 담당 업무 |
|------|------|------------|
| 🧭 **팀장** | **강우석** | 프로젝트 기획 · 프론트엔드 개발 |
| ⚙️ **팀원** | **송승주** | 백엔드 개발 · 서버 인프라 구축 |
| 🎨 **팀원** | **최준빈** | UI/UX 디자인 · 브랜드 비주얼 제작 |

---

### 💡 Team Vision  
> 기술과 디자인의 경계를 허물어,  
> **누구나 손쉽게 AI 영상 콘텐츠를 제작할 수 있는 세상**을 만듭니다.

## 🧩 System Architecture

TrynicAI는 **이미지 입력부터 영상 생성까지** 전 과정을 자동화한 AI 기반 웹 플랫폼입니다.  
전체 구조는 **Frontend → Backend → AI Engine → Cloud Infra**로 구성됩니다.

---

### 🔹 Architecture Overview
[User Browser]
↓
[Frontend (Next.js)]
↓ API 요청 (Axios / REST)
[Backend (Spring Boot)]
↓ AI 요청 (Fal API, YOLOv5 모델)
[AI Engine]
↓ 결과 저장 (AWS S3 / CloudFront)
[Client Dashboard] ← 결과 반환


---

### 🔹 Data Flow
1. **이미지 업로드**
   - 사용자가 제품 이미지를 업로드하면 YOLOv5 모델이 자동으로 제품 영역을 인식합니다.

2. **AI 영상 합성**
   - 인식된 이미지를 기반으로 Fal API가 **모델 착용/사용 장면 영상**을 자동 생성합니다.

3. **스타일 매칭**
   - 브랜드별 톤앤매너(색상·배경·조명)를 반영하여 영상이 자동 보정됩니다.

4. **결과 저장 및 전달**
   - 생성된 영상은 AWS S3에 저장되고, CloudFront를 통해 사용자의 대시보드로 즉시 제공됩니다.

5. **B2B 관리**
   - 기업별 프로젝트 관리, 수정 요청, 결과 다운로드를 지원하는 관리자 페이지 제공.

---

### 🧱 Tech Stack Summary

| Layer | Technology | Description |
|--------|-------------|-------------|
| **Frontend** | Next.js, TailwindCSS | 사용자 대시보드 및 영상 미리보기 UI |
| **Backend** | Spring Boot, MySQL | 사용자 관리, API 처리, 인증 로직 |
| **AI Engine** | Fal API, YOLOv5 | 영상 합성 및 이미지 인식 모델 |
| **Infra** | AWS S3, CloudFront, EC2 | 파일 저장 및 CDN 전송 |
| **Collaboration** | GitHub, Notion, Figma, Slack | 버전 관리 및 협업 도구 |

---

> 💬 **Core Idea:**  
> “한 장의 이미지를 AI 파이프라인으로 전달해,  
> 브랜드 맞춤형 숏폼 광고 영상을 자동 생성한다.”

## 🎥 Demo Video

> 아래 영상에서 TrynicAI의 핵심 기능과 실제 동작 과정을 확인할 수 있습니다.

[![TrynicAI Demo Video](https://img.youtube.com/vi/Z7EjJ330tmc/0.jpg)](https://www.youtube.com/watch?v=Z7EjJ330tmc)

### 📺 주요 데모 내용
- 제품 이미지 업로드 → AI 자동 분석
- 모델 착용 및 사용 영상 합성
- 브랜드 스타일 반영
- SNS용 숏폼 포맷 자동 변환
- 결과물 미리보기 및 다운로드

## 💻 Key Source Code

TrynicAI의 핵심 기능은 **Fal API**를 활용한 AI 영상 합성입니다.  
업로드된 제품 이미지를 Fal API로 전송하면,  
AI가 모델 착용/사용 장면을 자동으로 생성하고 결과 영상을 반환합니다.

---

### 🔹 Example: Fal API Integration (Spring Boot)

```java
// FalApiService.java
@Service
public class FalApiService {

    private static final String FAL_API_URL = "https://api.fal.ai/v1/videos/generate";
    private static final String FAL_API_KEY = "Bearer ${FAL_API_KEY}"; // 환경변수로 관리

    public String generateAdVideo(String imageUrl, String prompt) {
        try {
            JSONObject body = new JSONObject();
            body.put("image_url", imageUrl);
            body.put("prompt", prompt);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(FAL_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", FAL_API_KEY)
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Fal API로부터 영상 URL 반환
            JSONObject jsonResponse = new JSONObject(response.body());
            return jsonResponse.getString("video_url");

        } catch (Exception e) {
            throw new RuntimeException("Fal API 호출 실패", e);
        }
    }
}
