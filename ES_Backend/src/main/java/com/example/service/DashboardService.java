package com.example.service;

import com.example.response.DashboardResponse;
import com.example.entity.User;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
public class DashboardService {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private UserRepository userRepository;

    public DashboardResponse getStudentDashboard(Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        long total = progressRepository.findByStudent(student).size();
        long completed = progressRepository.countByStudentAndCompletedTrue(student);

        double percentage = total == 0 ? 0 : (completed * 100.0) / total;

        DashboardResponse response = new DashboardResponse();
        response.setTotalContent(total);
        response.setCompletedContent(completed);
        response.setProgressPercentage(percentage);

        return response;
    }
}