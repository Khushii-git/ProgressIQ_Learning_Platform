package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "folders")
public class Folder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String folderName;

    @ManyToOne
    private User user;

    private LocalDateTime createdAt;

    public Folder() {}

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getFolderName() { return folderName; }
    public void setFolderName(String folderName) { this.folderName = folderName; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Backward compatibility methods
    public User getStudent() { return user; }
    public void setStudent(User student) { this.user = student; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}