package com.example.response;

public class DashboardResponse {

    private long totalContent;
    private long completedContent;
    private double progressPercentage;

    public DashboardResponse() {}

    public long getTotalContent() { return totalContent; }
    public void setTotalContent(long totalContent) { this.totalContent = totalContent; }

    public long getCompletedContent() { return completedContent; }
    public void setCompletedContent(long completedContent) { this.completedContent = completedContent; }

    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}