package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import com.example.entity.*;
import java.util.List;
import java.util.Optional;

public interface ProgressRepository
        extends JpaRepository<StudentContentProgress, Long> {

    List<StudentContentProgress> findByStudent(User student);

    Optional<StudentContentProgress>
    findByStudentAndContent(User student, Content content);

    long countByStudentAndCompletedTrue(User student);

    long countByContentAndCompletedTrue(Content content);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentContentProgress p WHERE p.content.id = :contentId")
    void deleteByContentId(@Param("contentId") Long contentId);
}