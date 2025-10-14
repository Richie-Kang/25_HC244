package com.aiwebsite_back.api.admin.image.repository;

import com.aiwebsite_back.api.admin.image.Category;
import com.aiwebsite_back.api.admin.image.AdminImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<AdminImage, Long> {
    List<AdminImage> findByFileNameContainingAndCategory(String fileName, Category category);
    List<AdminImage> findByFileNameContaining(String fileName);
    List<AdminImage> findByCategory(Category category);
    List<AdminImage> findAllByOrderByCreatedAtDesc();
}