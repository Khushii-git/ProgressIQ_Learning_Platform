package com.example.service;

import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private UserRepository userRepository;

    public void markCompleted(Long contentId, Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        StudentContentProgress progress =
                progressRepository.findByStudentAndContent(student, content)
                        .orElse(new StudentContentProgress());

        progress.setStudent(student);
        progress.setContent(content);
        progress.setCompleted(true);
        progress.setCompletedAt(LocalDateTime.now());

        progressRepository.save(progress);
    }

    public boolean toggleCompleted(Long contentId, Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        StudentContentProgress progress =
                progressRepository.findByStudentAndContent(student, content)
                        .orElse(new StudentContentProgress());

        progress.setStudent(student);
        progress.setContent(content);
        
        // Toggle the completed status
        boolean newStatus = !progress.isCompleted();
        progress.setCompleted(newStatus);
        
        if (newStatus) {
            progress.setCompletedAt(LocalDateTime.now());
        } else {
            progress.setCompletedAt(null);
        }

        progressRepository.save(progress);
        return newStatus;
    }
}