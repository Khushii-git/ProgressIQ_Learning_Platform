package com.example.service;

import com.example.response.StudentProgressResponse;
import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherStudentRepository teacherStudentRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ProgressRepository progressRepository;

    /*
     * 1️⃣ Get teacher-assigned content for logged-in student
     */
    public List<Content> getTeacherAssignedContent(Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // If no teacher assigned, return empty list instead of throwing error
        var mapping = teacherStudentRepository.findByStudent(student);
        if (mapping.isEmpty()) {
            System.out.println("⚠️ No teacher assigned to student: " + student.getEmail());
            return List.of();
        }

        User teacher = mapping.get().getTeacher();

        return contentRepository
                .findByUploadedByAndIsPersonalFalse(teacher);
    }

    /*
     * 2️⃣ Get personal content added by student
     */
    public List<Content> getPersonalContent(Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return contentRepository
                .findByUploadedByAndIsPersonalTrue(student);
    }

    /*
     * 3️⃣ Get student progress as DTO (clean response)
     */
    public List<StudentProgressResponse> getStudentProgress(Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        return progressRepository.findByStudent(student)
                .stream()
                .map(progress -> {

                    StudentProgressResponse response =
                            new StudentProgressResponse();

                    response.setContentId(
                            progress.getContent().getId());
                    response.setContentTitle(
                            progress.getContent().getTitle());
                    response.setContentType(
                            progress.getContent()
                                    .getContentType()
                                    .name());
                    response.setCompleted(
                            progress.isCompleted());
                    response.setCompletedAt(
                            progress.getCompletedAt());

                    return response;
                })
                .collect(Collectors.toList());
    }
}