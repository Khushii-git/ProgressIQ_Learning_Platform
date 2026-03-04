package com.example.service;

import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> generateStudentReport(Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow();

        long total = progressRepository.findByStudent(student).size();
        long completed = progressRepository.countByStudentAndCompletedTrue(student);

        double percentage = total == 0 ? 0 : (completed * 100.0) / total;

        Map<String, Object> report = new HashMap<>();
        report.put("totalContent", total);
        report.put("completedContent", completed);
        report.put("progressPercentage", percentage);

        return report;
    }
}