package com.example.request;

import org.springframework.web.multipart.MultipartFile;

public class FileUploadRequest {

    private String title;
    private String description;
    private Long folderId;
    private MultipartFile file;
    private boolean isPersonal;

    public FileUploadRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getFolderId() { return folderId; }
    public void setFolderId(Long folderId) { this.folderId = folderId; }

    public MultipartFile getFile() { return file; }
    public void setFile(MultipartFile file) { this.file = file; }

    public boolean isPersonal() { return isPersonal; }
    public void setPersonal(boolean personal) { isPersonal = personal; }
}
