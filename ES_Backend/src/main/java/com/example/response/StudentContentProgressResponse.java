package com.example.response;

import java.util.List;

public class StudentContentProgressResponse {

    public static class StudentProgress {
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private List<ContentProgress> contentProgress;
        private double overallProgress;

        public StudentProgress() {}

        public StudentProgress(Long studentId, String studentName, String studentEmail, List<ContentProgress> contentProgress, double overallProgress) {
            this.studentId = studentId;
            this.studentName = studentName;
            this.studentEmail = studentEmail;
            this.contentProgress = contentProgress;
            this.overallProgress = overallProgress;
        }

        // Getters & Setters
        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getStudentEmail() { return studentEmail; }
        public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

        public List<ContentProgress> getContentProgress() { return contentProgress; }
        public void setContentProgress(List<ContentProgress> contentProgress) { this.contentProgress = contentProgress; }

        public double getOverallProgress() { return overallProgress; }
        public void setOverallProgress(double overallProgress) { this.overallProgress = overallProgress; }
    }

    public static class ContentProgress {
        private Long contentId;
        private String contentTitle;
        private String contentType;
        private boolean completed;
        private String completedAt;  // ISO format timestamp

        public ContentProgress() {}

        public ContentProgress(Long contentId, String contentTitle, String contentType, boolean completed, String completedAt) {
            this.contentId = contentId;
            this.contentTitle = contentTitle;
            this.contentType = contentType;
            this.completed = completed;
            this.completedAt = completedAt;
        }

        // Getters & Setters
        public Long getContentId() { return contentId; }
        public void setContentId(Long contentId) { this.contentId = contentId; }

        public String getContentTitle() { return contentTitle; }
        public void setContentTitle(String contentTitle) { this.contentTitle = contentTitle; }

        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }

        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }

        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    }

    private List<StudentProgress> students;
    private int totalStudents;
    private int totalContent;
    private double averageCompletion;

    public StudentContentProgressResponse() {}

    public StudentContentProgressResponse(List<StudentProgress> students, int totalStudents, int totalContent, double averageCompletion) {
        this.students = students;
        this.totalStudents = totalStudents;
        this.totalContent = totalContent;
        this.averageCompletion = averageCompletion;
    }

    // Getters & Setters
    public List<StudentProgress> getStudents() { return students; }
    public void setStudents(List<StudentProgress> students) { this.students = students; }

    public int getTotalStudents() { return totalStudents; }
    public void setTotalStudents(int totalStudents) { this.totalStudents = totalStudents; }

    public int getTotalContent() { return totalContent; }
    public void setTotalContent(int totalContent) { this.totalContent = totalContent; }

    public double getAverageCompletion() { return averageCompletion; }
    public void setAverageCompletion(double averageCompletion) { this.averageCompletion = averageCompletion; }
}
