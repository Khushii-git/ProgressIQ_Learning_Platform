package com.example.response;

public class ContentAnalyticsResponse {

    private Long contentId;
    private String title;
    private long completedCount;

    public ContentAnalyticsResponse() {}

    public Long getContentId() { return contentId; }
    public void setContentId(Long contentId) { this.contentId = contentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public long getCompletedCount() { return completedCount; }
    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }
}