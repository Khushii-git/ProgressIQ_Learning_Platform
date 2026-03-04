package com.example.service;

import com.example.request.ContentRequest;
import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;

@Service
public class ContentService {

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private FileService fileService;

    @Autowired
    private ProgressRepository progressRepository;

    @Autowired
    private TeacherStudentRepository teacherStudentRepository;

    public Content getContentById(Long contentId) {
        return contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));
    }

    public Content addContent(ContentRequest request, Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Content content = new Content();
        content.setTitle(request.getTitle());
        content.setContentUrl(request.getUrl());
        content.setContentType(
                Content.ContentType.valueOf(request.getType().toUpperCase())
        );
        content.setUploadedBy(user);

        if (user.getRole() == User.Role.STUDENT) {
            content.setPersonal(true);

            if (request.getFolderId() != null) {
                Folder folder = folderRepository.findById(request.getFolderId())
                        .orElseThrow(() -> new RuntimeException("Folder not found"));
                content.setFolder(folder);
            }
        } else {
            content.setPersonal(false);
        }

        return contentRepository.save(content);
    }

    /**
     * Add uploaded material (file) to database
     */
    public Content addUploadedMaterial(String title, FileService.FileUploadResponse uploadResponse, 
                                       Long folderId, boolean isPersonal, Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Content content = new Content();
        content.setTitle(title);
        content.setFileName(uploadResponse.getOriginalFileName());
        content.setFileSize(uploadResponse.getFileSize());
        content.setFilePath(uploadResponse.getFilePath());
        content.setUploadedBy(user);
        content.setPersonal(isPersonal);

        // Determine content type based on file extension
        String extension = uploadResponse.getExtension().toLowerCase();
        if (extension.matches("pdf|doc|docx|txt|xls|xlsx")) {
            content.setContentType(Content.ContentType.DOCUMENT);
        } else if (extension.matches("mp4|avi|mov|mkv")) {
            content.setContentType(Content.ContentType.VIDEO);
        } else if (extension.matches("mp3|wav|m4a")) {
            content.setContentType(Content.ContentType.DOCUMENT); // Store audio as document for now
        } else {
            content.setContentType(Content.ContentType.FILE);
        }

        // Add to folder if folderId provided
        if (folderId != null) {
            Folder folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new RuntimeException("Folder not found"));
            content.setFolder(folder);
        }

        return contentRepository.save(content);
    }

    /**
     * Get all content in a specific folder
     */
    public List<Content> getContentByFolder(Long folderId) {
        return contentRepository.findByFolderId(folderId);
    }

    /**
     * Delete content and associated file
     */
    public void deleteContent(Long contentId, Principal principal) {
        Content content = getContentById(contentId);

        // Verify ownership
        if (!content.getUploadedBy().getEmail().equals(principal.getName())) {
            throw new RuntimeException("Unauthorized: You can only delete your own content");
        }

        // Delete associated progress records first (foreign key constraint)
        progressRepository.deleteByContentId(contentId);
        System.out.println("✓ Student progress records deleted");

        // Delete file if exists
        if (content.getFilePath() != null && !content.getFilePath().isEmpty()) {
            try {
                fileService.deleteFileByPath(content.getFilePath());
                System.out.println("✓ File deleted: " + content.getFilePath());
            } catch (Exception e) {
                System.out.println("⚠️ Could not delete file: " + e.getMessage());
            }
        }

        contentRepository.delete(content);
        System.out.println("✓ Content deleted: " + content.getTitle());
    }

    public List<Content> getTeacherContent(Principal principal) {

        User teacher = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return contentRepository.findByUploadedByAndIsPersonalFalse(teacher);
    }

    public List<Content> getStudentPersonalContent(Principal principal) {

        User student = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return only personal materials NOT in any folder
        return contentRepository.findByUploadedByAndIsPersonalTrueAndFolderIsNull(student);
    }

    /**
     * Update content details (title, type, url)
     */
    public Content updateContent(Long contentId, ContentRequest request, Principal principal) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        // Verify ownership
        if (!content.getUploadedBy().getEmail().equals(principal.getName())) {
            throw new RuntimeException("Unauthorized: You can only update your own content");
        }

        // Update content
        content.setTitle(request.getTitle());
        content.setContentUrl(request.getUrl());
        content.setContentType(
                Content.ContentType.valueOf(request.getType().toUpperCase())
        );

        return contentRepository.save(content);
    }

    /**
     * Check whether the requester can access a teacher-uploaded content.
     * Allowed if requester is the uploader (teacher) or a student assigned to that teacher.
     */
    public boolean canAccessTeacherContent(User requester, Content content) {
        if (requester == null || content == null || content.getUploadedBy() == null) {
            return false;
        }

        // Teachers can access their own uploads
        if (requester.getId().equals(content.getUploadedBy().getId())) {
            return true;
        }

        // Students can access materials from their assigned teacher
        if (requester.getRole() == User.Role.STUDENT) {
            return teacherStudentRepository.findByStudent(requester)
                    .map(mapping -> mapping.getTeacher().getId().equals(content.getUploadedBy().getId()))
                    .orElse(false);
        }

        return false;
    }
}