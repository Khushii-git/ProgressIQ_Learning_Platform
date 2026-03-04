package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_content_progress",
        uniqueConstraints =
        @UniqueConstraint(columnNames = {"student_id", "content_id"})
)
public class StudentContentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔹 Student reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // 🔹 Content reference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    // 🔹 Completion flag
    @Column(nullable = false)
    private boolean completed = false;

    // 🔹 Completion timestamp
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // 🔹 Creation timestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public StudentContentProgress() {}

    public StudentContentProgress(User student, Content content) {
        this.student = student;
        this.content = content;
        this.completed = false;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // ======================
    // Getters & Setters
    // ======================

    public Long getId() { return id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Content getContent() { return content; }
    public void setContent(Content content) { this.content = content; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
}