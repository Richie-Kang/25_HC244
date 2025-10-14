package com.aiwebsite_back.api.my.repository;

import com.aiwebsite_back.api.my.AIVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AIVideoRepository extends JpaRepository<AIVideo, Long> {

    List<AIVideo> findAllByCreator(String creator);

    List<AIVideo> findAllByCreatorAndMode(String creator, AIVideo.VideoType mode);

    List<AIVideo> findAllByShareTrue();
    
    @Modifying
    @Query("UPDATE AIVideo a SET a.creator = :newCreator WHERE a.creator = :oldCreator")
    int updateCreatorName(@Param("oldCreator") String oldCreator, @Param("newCreator") String newCreator);
}
