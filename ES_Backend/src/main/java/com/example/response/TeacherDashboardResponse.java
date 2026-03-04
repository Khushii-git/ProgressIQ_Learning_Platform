package com.example.response;

import java.util.List;

public class TeacherDashboardResponse {

    private long totalStudents;
    private long totalContent;

    private List<StudentSummaryResponse> students;
    private List<ContentAnalyticsResponse> contentAnalytics;

    public TeacherDashboardResponse() {}

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalContent() { return totalContent; }
    public void setTotalContent(long totalContent) {
        this.totalContent = totalContent;
    }

    public List<StudentSummaryResponse> getStudents() {
        return students;
    }

    public void setStudents(List<StudentSummaryResponse> students) {
        this.students = students;
    }

    public List<ContentAnalyticsResponse> getContentAnalytics() {
        return contentAnalytics;
    }

    public void setContentAnalytics(
            List<ContentAnalyticsResponse> contentAnalytics) {
        this.contentAnalytics = contentAnalytics;
    }
}