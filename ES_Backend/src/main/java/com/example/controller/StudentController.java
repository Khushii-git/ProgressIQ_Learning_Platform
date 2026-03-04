package com.example.controller;

import com.example.response.StudentProgressResponse;
import com.example.entity.Content;
import com.example.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /*
     * 1️⃣ Get teacher assigned content
     */
    @GetMapping("/assigned-content")
    public List<Content> getAssignedContent(Principal principal) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("\n📍 [StudentController] /assigned-content endpoint");
        System.out.println("👤 Principal: " + principal.getName());
        System.out.println("🔒 Authentication: " + auth);
        System.out.println("📋 Authorities: " + auth.getAuthorities());

        return studentService.getTeacherAssignedContent(principal);
    }

    /*
     * 2️⃣ Get student progress (DTO version, clean)
     */
    @GetMapping("/progress")
    public List<StudentProgressResponse> getMyProgress(
            Principal principal) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("\n📍 [StudentController] /progress endpoint");
        System.out.println("👤 Principal: " + principal.getName());
        System.out.println("📋 Authorities: " + auth.getAuthorities());

        return studentService.getStudentProgress(principal);
    }

    /*
     * 3️⃣ Get personal content
     */
    @GetMapping("/personal-content")
    public List<Content> getPersonalContent(Principal principal) {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("\n📍 [StudentController] /personal-content endpoint");
        System.out.println("👤 Principal: " + principal.getName());
        System.out.println("📋 Authorities: " + auth.getAuthorities());

        return studentService.getPersonalContent(principal);
    }
}