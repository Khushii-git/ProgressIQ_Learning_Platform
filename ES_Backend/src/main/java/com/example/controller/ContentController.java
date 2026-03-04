package com.example.controller;

import com.example.request.ContentRequest;
import com.example.entity.Content;
import com.example.entity.User;
import com.example.repository.UserRepository;
import com.example.service.ContentService;
import com.example.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.security.Principal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/content")
public class ContentController {

    @Autowired
    private ContentService contentService;

    @Autowired
    private FileService fileService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/add")
    public Content addContent(@Valid @RequestBody ContentRequest request,
                              Principal principal) {
        return contentService.addContent(request, principal);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam(value = "isPersonal", defaultValue = "true") boolean isPersonal,
            Principal principal) {
        
        try {
            System.out.println("\n📁 File Upload Endpoint");
            System.out.println("📌 Title: " + title);
            System.out.println("📂 Folder ID: " + folderId);
            System.out.println("👤 User: " + principal.getName());
            System.out.println("📦 File: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");

            // Upload file
            FileService.FileUploadResponse uploadResponse = fileService.uploadFile(file);

            // Add content to database
            Content content = contentService.addUploadedMaterial(
                    title, 
                    uploadResponse, 
                    folderId, 
                    isPersonal, 
                    principal
            );

            System.out.println("✓ Material added successfully with ID: " + content.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "File uploaded successfully",
                    "contentId", content.getId(),
                    "fileName", uploadResponse.getOriginalFileName(),
                    "fileSize", uploadResponse.getFileSize()
            ));

        } catch (Exception e) {
            System.out.println("✗ Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/teacher")
    public List<Content> getTeacherContent(Principal principal) {
        return contentService.getTeacherContent(principal);
    }

    @GetMapping("/personal")
    public List<Content> getStudentPersonalContent(Principal principal) {
        return contentService.getStudentPersonalContent(principal);
    }

    @GetMapping("/folder/{folderId}")
    public List<Content> getContentByFolder(@PathVariable Long folderId) {
        return contentService.getContentByFolder(folderId);
    }

    /**
     * Download/open an uploaded file by contentId.
     * Must be called with Authorization header (JWT).
     */
    @GetMapping("/file/{contentId}")
    public ResponseEntity<Resource> downloadUploadedFile(@PathVariable Long contentId, Principal principal) {
        Content content = contentService.getContentById(contentId);

        User requester = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!contentService.canAccessTeacherContent(requester, content)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (content.getFilePath() == null || content.getFilePath().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Resource resource = fileService.loadAsResource(content.getFilePath());

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            Path p = Paths.get(content.getFilePath());
            String detected = Files.probeContentType(p);
            if (detected != null && !detected.isBlank()) {
                mediaType = MediaType.parseMediaType(detected);
            }
        } catch (Exception ignored) {
        }

        String downloadName = (content.getFileName() != null && !content.getFileName().isBlank())
                ? content.getFileName()
                : "download";

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + downloadName.replace("\"", "") + "\"")
                .body(resource);
    }

    @DeleteMapping("/{contentId}")
    public ResponseEntity<?> deleteContent(@PathVariable Long contentId, Principal principal) {
        try {
            contentService.deleteContent(contentId, principal);
            return ResponseEntity.ok(Map.of("success", true, "message", "Content deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/{contentId}")
    public ResponseEntity<?> updateContent(@PathVariable Long contentId,
                                          @RequestBody ContentRequest request,
                                          Principal principal) {
        try {
            Content updatedContent = contentService.updateContent(contentId, request, principal);
            return ResponseEntity.ok(updatedContent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}