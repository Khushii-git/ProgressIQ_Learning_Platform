package com.example.controller;

import com.example.response.TeacherDashboardResponse;
import com.example.response.StudentSummaryResponse;
import com.example.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/teacher")
public class TeacherController {

    @Autowired
    private TeacherService teacherService;

    /*
     * 1️⃣ Get registered students with progress %
     */
    @GetMapping("/students")
    public List<StudentSummaryResponse> getRegisteredStudents(
            Principal principal) {

        return teacherService.getRegisteredStudents(principal);
    }

    /*
     * 2️⃣ Get full teacher dashboard (recommended endpoint)
     */
    @GetMapping("/dashboard")
    public TeacherDashboardResponse getDashboard(
            Principal principal) {

        return teacherService.getTeacherDashboard(principal);
    }

    /*
     * 3️⃣ Get completion count for specific content
     */
    @GetMapping("/content-completion/{contentId}")
    public long getCompletionCount(
            @PathVariable Long contentId) {

        return teacherService.getCompletedCountForContent(contentId);
    }

    /*
     * 4️⃣ Get detailed student-by-content progress matrix
     * Shows which students completed which content (recommended for progress tracking)
     */
    @GetMapping("/student-content-progress")
    public com.example.response.StudentContentProgressResponse getStudentContentProgress(
            Principal principal) {

        return teacherService.getStudentContentProgress(principal);
    }
}