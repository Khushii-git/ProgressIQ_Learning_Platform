package com.example.controller;

import com.example.request.FolderRequest;
import com.example.entity.Folder;
import com.example.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/folder")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @PostMapping("/create")
    public ResponseEntity<?> createFolder(@Valid @RequestBody FolderRequest request,
                               Principal principal) {
        try {
            Folder folder = folderService.createFolder(request, principal);
            return ResponseEntity.ok(folder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public List<Folder> getMyFolders(Principal principal) {
        return folderService.getStudentFolders(principal);
    }

    @PutMapping("/update/{folderId}")
    public ResponseEntity<?> updateFolder(@PathVariable Long folderId,
                               @Valid @RequestBody FolderRequest request,
                               Principal principal) {
        try {
            Folder folder = folderService.updateFolder(folderId, request, principal);
            return ResponseEntity.ok(folder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long folderId,
                            Principal principal) {
        try {
            folderService.deleteFolder(folderId, principal);
            return ResponseEntity.ok(Map.of("success", true, "message", "Folder deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}