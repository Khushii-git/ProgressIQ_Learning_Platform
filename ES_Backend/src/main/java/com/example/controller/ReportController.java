package com.example.controller;

import com.example.service.PdfService;
import com.example.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/report")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private PdfService pdfService;

    @GetMapping("/student")
    public Map<String, Object> getStudentReport(Principal principal) {
        return reportService.generateStudentReport(principal);
    }

    /**
     * Generate and download PDF progress report
     */
    @GetMapping("/download-pdf")
    public ResponseEntity<?> downloadProgressReport(Principal principal) {
        try {
            System.out.println("\n📊 PDF Report Download Request");
            System.out.println("👤 User: " + principal.getName());

            String filePath = pdfService.generateProgressReport(principal);
            File file = new File(filePath);

            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Report file not found"));
            }

            String fileName = file.getName();

            System.out.println("✓ Sending PDF: " + fileName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new FileSystemResource(file));

        } catch (Exception e) {
            System.out.println("✗ PDF download failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * Generate and download detailed PDF report with analytics
     */
    @GetMapping("/download-detailed-pdf")
    public ResponseEntity<?> downloadDetailedReport(Principal principal) {
        try {
            System.out.println("\n📊 Detailed PDF Report Download Request");
            System.out.println("👤 User: " + principal.getName());

            String filePath = pdfService.generateDetailedReport(principal);
            File file = new File(filePath);

            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Report file not found"));
            }

            String fileName = file.getName();

            System.out.println("✓ Sending detailed PDF: " + fileName);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new FileSystemResource(file));

        } catch (Exception e) {
            System.out.println("✗ Detailed PDF download failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}