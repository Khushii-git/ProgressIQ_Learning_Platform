package com.example.service;

import com.example.request.FolderRequest;
import com.example.entity.*;
import com.example.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;

@Service
public class FolderService {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContentRepository contentRepository;

    public Folder createFolder(FolderRequest request, Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = new Folder();
        folder.setFolderName(request.getFolderName());
        folder.setUser(user);

        return folderRepository.save(folder);
    }

    public List<Folder> getStudentFolders(Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return folderRepository.findByUser(user);
    }

    public Folder updateFolder(Long folderId, FolderRequest request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        // Verify that the folder belongs to the current user
        if (!folder.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this folder");
        }

        folder.setFolderName(request.getFolderName());
        return folderRepository.save(folder);
    }

    public void deleteFolder(Long folderId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new RuntimeException("Folder not found"));

        // Verify that the folder belongs to the current user (works for both students and teachers)
        if (!folder.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this folder");
        }

        // Move all contents in this folder to loose materials (folderId = null)
        List<Content> folderContents = contentRepository.findByFolder(folder);
        for (Content content : folderContents) {
            content.setFolder(null);
            contentRepository.save(content);
        }

        folderRepository.deleteById(folderId);
    }
}