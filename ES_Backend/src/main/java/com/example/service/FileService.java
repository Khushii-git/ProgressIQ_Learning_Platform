package com.example.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {

    private static final String UPLOAD_DIR = "uploads/materials";
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

    public Path getUploadBasePath() {
        return Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
    }

    // Allowed file extensions
    private static final String[] ALLOWED_EXTENSIONS = {
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "txt", "csv", "zip", "mp4", "avi", "mov", "mkv",
            "mp3", "wav", "m4a", "jpg", "jpeg", "png", "gif"
    };

    public FileService() {
        // Create upload directory if it doesn't exist
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
    }

    /**
     * Upload a file and return file metadata
     */
    public FileUploadResponse uploadFile(MultipartFile file) {

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 100MB");
        }

        // Get file extension
        String originalFileName = file.getOriginalFilename();
        String extension = getFileExtension(originalFileName);

        // Validate extension
        if (!isValidExtension(extension)) {
            throw new RuntimeException("File type not allowed. Allowed types: PDF, DOC, XLS, MP4, MP3, etc.");
        }

        // Generate unique filename
        String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
        Path filePath = Paths.get(UPLOAD_DIR, uniqueFileName);

        try {
            // Save file
            Files.copy(file.getInputStream(), filePath);

            System.out.println("✓ File uploaded successfully: " + uniqueFileName);

            return new FileUploadResponse(
                    uniqueFileName,
                    originalFileName,
                    filePath.toString(),
                    formatFileSize(file.getSize()),
                    file.getSize(),
                    extension
            );
        } catch (IOException e) {
            System.out.println("✗ File upload failed: " + e.getMessage());
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Delete a file
     */
    public void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR, fileName);
            Files.deleteIfExists(filePath);
            System.out.println("✓ File deleted: " + fileName);
        } catch (IOException e) {
            System.out.println("✗ File deletion failed: " + e.getMessage());
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Delete a file by absolute/relative path stored in DB (e.g., uploads/materials/<uuid>_<name>)
     */
    public void deleteFileByPath(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            return;
        }

        try {
            Path target = Paths.get(storedPath).toAbsolutePath().normalize();
            Path base = getUploadBasePath();

            if (!target.startsWith(base)) {
                throw new RuntimeException("Refusing to delete file outside upload directory");
            }

            Files.deleteIfExists(target);
            System.out.println("✓ File deleted by path: " + target);
        } catch (IOException e) {
            System.out.println("✗ File deletion failed: " + e.getMessage());
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    /**
     * Load an uploaded file as a Spring Resource from a stored path.
     */
    public Resource loadAsResource(String storedPath) {
        if (storedPath == null || storedPath.isBlank()) {
            throw new RuntimeException("File path is empty");
        }

        try {
            Path target = Paths.get(storedPath).toAbsolutePath().normalize();
            Path base = getUploadBasePath();

            if (!target.startsWith(base)) {
                throw new RuntimeException("Refusing to access file outside upload directory");
            }

            Resource resource = new UrlResource(target.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("File not found");
            }
            return resource;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load file: " + e.getMessage());
        }
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
    }

    /**
     * Validate file extension
     */
    private boolean isValidExtension(String extension) {
        for (String allowed : ALLOWED_EXTENSIONS) {
            if (allowed.equalsIgnoreCase(extension)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Format file size for display
     */
    private String formatFileSize(long bytes) {
        if (bytes <= 0) return "0 B";
        final String[] units = new String[]{"B", "KB", "MB", "GB"};
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return String.format("%.2f %s", bytes / Math.pow(1024, digitGroups), units[digitGroups]);
    }

    public static class FileUploadResponse {
        public String uniqueFileName;
        public String originalFileName;
        public String filePath;
        public String fileSize;
        public long fileSizeBytes;
        public String extension;

        public FileUploadResponse(String uniqueFileName, String originalFileName, String filePath, 
                                  String fileSize, long fileSizeBytes, String extension) {
            this.uniqueFileName = uniqueFileName;
            this.originalFileName = originalFileName;
            this.filePath = filePath;
            this.fileSize = fileSize;
            this.fileSizeBytes = fileSizeBytes;
            this.extension = extension;
        }

        // Getters
        public String getUniqueFileName() { return uniqueFileName; }
        public String getOriginalFileName() { return originalFileName; }
        public String getFilePath() { return filePath; }
        public String getFileSize() { return fileSize; }
        public long getFileSizeBytes() { return fileSizeBytes; }
        public String getExtension() { return extension; }
    }
}
