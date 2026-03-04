package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.entity.*;
import java.util.List;

public interface ContentRepository extends JpaRepository<Content, Long> {

    List<Content> findByUploadedByAndIsPersonalFalse(User teacher);

    List<Content> findByIsPersonalFalse();

    List<Content> findByUploadedByAndIsPersonalTrue(User student);

    // Get only personal materials NOT in any folder
    List<Content> findByUploadedByAndIsPersonalTrueAndFolderIsNull(User student);

    List<Content> findByFolderId(Long folderId);

    List<Content> findByFolder(Folder folder);
}