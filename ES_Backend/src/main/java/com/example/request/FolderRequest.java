package com.example.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FolderRequest {

    @NotBlank(message = "Folder name is required")
    @Size(min = 1, max = 100, message = "Folder name must be between 1 and 100 characters")
    private String folderName;

    public FolderRequest() {}

    public String getFolderName() { return folderName; }
    public void setFolderName(String folderName) { this.folderName = folderName; }
}