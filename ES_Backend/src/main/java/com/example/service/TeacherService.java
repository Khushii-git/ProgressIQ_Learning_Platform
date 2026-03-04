package com.example.service;

import com.example.response.*;
import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    @Autowired
    private TeacherStudentRepository mappingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private ProgressRepository progressRepository;

    /*
     * 1️⃣ Get registered students for logged-in teacher
     */
    public List<StudentSummaryResponse> getRegisteredStudents(Principal principal) {

        User teacher = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<User> students = mappingRepository.findByTeacher(teacher)
                .stream()
                .map(TeacherStudentMapping::getStudent)
                .collect(Collectors.toList());

        return students.stream().map(student -> {

            long total = progressRepository.findByStudent(student).size();
            long completed =
                    progressRepository.countByStudentAndCompletedTrue(student);

            double percentage =
                    total == 0 ? 0 :
                            (completed * 100.0) / total;

            StudentSummaryResponse summary =
                    new StudentSummaryResponse();

            summary.setStudentId(student.getId());
            summary.setStudentName(student.getUsername());
            summary.setStudentEmail(student.getEmail());
            summary.setProgressPercentage(percentage);

            return summary;

        }).collect(Collectors.toList());
    }

    /*
     * 2️⃣ Get full teacher dashboard
     */
    public TeacherDashboardResponse getTeacherDashboard(Principal principal) {

        User teacher = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<User> students = mappingRepository.findByTeacher(teacher)
                .stream()
                .map(TeacherStudentMapping::getStudent)
                .collect(Collectors.toList());

        List<Content> contents =
                contentRepository.findByUploadedByAndIsPersonalFalse(teacher);

        TeacherDashboardResponse response =
                new TeacherDashboardResponse();

        response.setTotalStudents(students.size());
        response.setTotalContent(contents.size());

        // Student summaries
        List<StudentSummaryResponse> studentSummaries =
                students.stream().map(student -> {

                    long total =
                            progressRepository.findByStudent(student).size();

                    long completed =
                            progressRepository
                                    .countByStudentAndCompletedTrue(student);

                    double percentage =
                            total == 0 ? 0 :
                                    (completed * 100.0) / total;

                    StudentSummaryResponse summary =
                            new StudentSummaryResponse();

                    summary.setStudentId(student.getId());
                    summary.setStudentName(student.getUsername());
                    summary.setStudentEmail(student.getEmail());
                    summary.setProgressPercentage(percentage);

                    return summary;

                }).collect(Collectors.toList());

        response.setStudents(studentSummaries);

        // Content analytics
        List<ContentAnalyticsResponse> analytics =
                contents.stream().map(content -> {

                    long completed =
                            progressRepository
                                    .countByContentAndCompletedTrue(content);

                    ContentAnalyticsResponse ca =
                            new ContentAnalyticsResponse();

                    ca.setContentId(content.getId());
                    ca.setTitle(content.getTitle());
                    ca.setCompletedCount(completed);

                    return ca;

                }).collect(Collectors.toList());

        response.setContentAnalytics(analytics);

        return response;
    }

    /*
     * 3️⃣ Get completion count for specific content
     */
    public long getCompletedCountForContent(Long contentId) {

        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        return progressRepository
                .countByContentAndCompletedTrue(content);
    }

    /*
     * 4️⃣ Get detailed student-by-content progress matrix
     * Shows which students completed which content
     */
    public StudentContentProgressResponse getStudentContentProgress(Principal principal) {

        User teacher = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        List<User> students = mappingRepository.findByTeacher(teacher)
                .stream()
                .map(TeacherStudentMapping::getStudent)
                .collect(Collectors.toList());

        List<Content> contents =
                contentRepository.findByUploadedByAndIsPersonalFalse(teacher);

        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        // Build student progress list
        List<StudentContentProgressResponse.StudentProgress> studentProgressList =
                students.stream().map(student -> {

                    // Get all progress records for this student
                    List<StudentContentProgress> progressRecords =
                            progressRepository.findByStudent(student);

                    // Map each content to show completion status
                    List<StudentContentProgressResponse.ContentProgress> contentProgressList =
                            contents.stream().map(content -> {

                                StudentContentProgress progress = progressRecords.stream()
                                        .filter(p -> p.getContent().getId().equals(content.getId()))
                                        .findFirst()
                                        .orElse(null);

                                String completedAt = null;
                                boolean completed = false;

                                if (progress != null && progress.isCompleted()) {
                                    completed = true;
                                    if (progress.getCompletedAt() != null) {
                                        completedAt = progress.getCompletedAt().format(formatter);
                                    }
                                }

                                return new StudentContentProgressResponse.ContentProgress(
                                        content.getId(),
                                        content.getTitle(),
                                        content.getContentType().name(),
                                        completed,
                                        completedAt
                                );

                            }).collect(Collectors.toList());

                    // Calculate overall progress for this student
                    long completedCount = contentProgressList.stream()
                            .filter(StudentContentProgressResponse.ContentProgress::isCompleted)
                            .count();

                    double overallProgress = contents.isEmpty() ? 0 :
                            (completedCount * 100.0) / contents.size();

                    return new StudentContentProgressResponse.StudentProgress(
                            student.getId(),
                            student.getUsername(),
                            student.getEmail(),
                            contentProgressList,
                            overallProgress
                    );

                }).collect(Collectors.toList());

        // Calculate class average completion
        double averageCompletion = studentProgressList.isEmpty() ? 0 :
                studentProgressList.stream()
                        .mapToDouble(StudentContentProgressResponse.StudentProgress::getOverallProgress)
                        .average()
                        .orElse(0);

        return new StudentContentProgressResponse(
                studentProgressList,
                students.size(),
                contents.size(),
                averageCompletion
        );
    }
}