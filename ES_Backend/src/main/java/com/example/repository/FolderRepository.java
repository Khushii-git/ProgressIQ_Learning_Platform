package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.entity.*;
import java.util.List;

public interface FolderRepository extends JpaRepository<Folder, Long> {
    List<Folder> findByUser(User user);
    
    // Backward compatibility
    default List<Folder> findByStudent(User student) {
        return findByUser(student);
    }
}