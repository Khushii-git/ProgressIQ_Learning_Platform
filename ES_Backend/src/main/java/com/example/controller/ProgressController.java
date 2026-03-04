package com.example.controller;

import com.example.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @PostMapping("/complete/{contentId}")
    public String markCompleted(@PathVariable Long contentId,
                                Principal principal) {
        progressService.markCompleted(contentId, principal);
        return "Content marked as completed";
    }

    @PostMapping("/toggle/{contentId}")
    public ResponseEntity<?> toggleCompleted(@PathVariable Long contentId,
                                            Principal principal) {
        try {
            boolean newStatus = progressService.toggleCompleted(contentId, principal);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", newStatus ? "Content marked as completed" : "Content marked as incomplete",
                    "completed", newStatus
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}