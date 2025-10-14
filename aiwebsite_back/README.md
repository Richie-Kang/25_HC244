# AI Website Backend

## Overview
The AI Website Backend is a Spring Boot application designed to handle image uploads, metadata storage, and retrieval. It provides RESTful APIs for managing images and blogs.

## Features
- **Image Upload**: Upload images and store their metadata.
- **Image Retrieval**: Retrieve all images or search for related images by name.
- **Blog Management**: Create and retrieve blog posts.

## Technologies Used
- **Java**
- **Spring Boot**
- **Gradle**
- **Lombok**
- **H2 Database** (or your preferred database)

## Getting Started

### Prerequisites
- Java 11 or higher
- Gradle
- An IDE like IntelliJ IDEA

### Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/ai-website-back.git
    cd ai-website-back
    ```

2. Build the project:
    ```sh
    ./gradlew build
    ```

3. Run the application:
    ```sh
    ./gradlew bootRun
    ```

### Configuration
- Configure the database settings in `src/main/resources/application.properties`.

## API Endpoints

### Image Endpoints
- **Upload Images**
    ```http
    POST /api/images/upload
    ```
    - Request: `multipart/form-data`
    - Response: `ImageResponse`

- **Get All Images**
    ```http
    GET /api/images
    ```
    - Response: `List<ImageResponse>`

- **Search Related Images**
    ```http
    GET /api/images/search
    ```
    - Request: `imageName` (query parameter)
    - Response: `List<ImageSearchResponse>`

### Blog Endpoints
- **Create Blog**
    ```http
    POST /api/blogs
    ```
    - Request: `BlogRequest`
    - Response: `BlogResponse`

- **Get All Blogs**
    ```http
    GET /api/blogs
    ```
    - Response: `List<BlogListResponse>`

## Project Structure