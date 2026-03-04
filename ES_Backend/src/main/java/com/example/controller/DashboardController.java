package com.example.controller;

import com.example.response.DashboardResponse;
import com.example.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/student")
    public DashboardResponse getStudentDashboard(Principal principal) {
        return dashboardService.getStudentDashboard(principal);
    }
}