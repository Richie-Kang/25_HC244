package com.aiwebsite_back.api.blog.service;

import com.aiwebsite_back.api.blog.Blog;
import com.aiwebsite_back.api.blog.repository.BlogRepository;
import com.aiwebsite_back.api.blog.request.BlogRequest;
import com.aiwebsite_back.api.blog.response.BlogGetResponse;
import com.aiwebsite_back.api.blog.response.BlogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BlogService {

    private final BlogRepository blogRepository;

    public BlogResponse createBlog(BlogRequest blog, String imageUrl) {
        BlogResponse blogResponse = new BlogResponse();
        try {
            Blog createdBlog = Blog.builder()
                    .title(blog.getTitle())
                    .subtitle(blog.getSubtitle())
                    .author(blog.getAuthor())
                    .image(imageUrl)
                    .content(blog.getContent())
                    .date(LocalDateTime.now())
                    .build();
            blogRepository.save(createdBlog);
            blogResponse.setMessage("Blog created successfully");
        } catch (DataIntegrityViolationException e) {
            blogResponse.setMessage("Data integrity violation");
        } catch (Exception e) {
            blogResponse.setMessage("An error occurred while creating the blog");
        }
        return blogResponse;
    }

    public List<Blog> getAllBlogs() {
        return blogRepository.findAll();
    }

    public BlogGetResponse getBlog(Long id) {
        return blogRepository.findById(id)
                .map(blog -> new BlogGetResponse(
                        blog.getTitle(),
                        blog.getSubtitle(),
                        blog.getAuthor(),
                        blog.getContent(),
                        blog.getImage(),
                        blog.getDate().toString()
                ))
                .orElse(null);
    }
}