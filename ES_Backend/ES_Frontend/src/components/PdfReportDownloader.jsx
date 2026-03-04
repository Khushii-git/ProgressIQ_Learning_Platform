import React, { useState } from 'react';
import axios from 'axios';
import '../styles/PdfReportDownloader.css';

const PdfReportDownloader = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const downloadReport = async (reportType) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const endpoint = reportType === 'detailed' 
        ? '/api/report/download-detailed-pdf'
        : '/api/report/download-pdf';

      const response = await axios.get(endpoint, {
        responseType: 'blob'
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progress-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(`✓ Report downloaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      console.error('Download error:', err);
      setError(err.response?.data?.message || 'Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-downloader-container">
      <div className="report-card">
        <h3>📊 Download Progress Report</h3>
        <p className="subtitle">Generate and download your learning progress as PDF</p>

        <div className="report-grid">
          <button
            onClick={() => downloadReport('simple')}
            disabled={loading}
            className="report-button basic"
          >
            <div className="button-icon">📄</div>
            <div className="button-title">Basic Report</div>
            <div className="button-desc">Summary of your progress</div>
          </button>

          <button
            onClick={() => downloadReport('detailed')}
            disabled={loading}
            className="report-button detailed"
          >
            <div className="button-icon">📈</div>
            <div className="button-title">Detailed Report</div>
            <div className="button-desc">Complete analytics with insights</div>
          </button>
        </div>

        {loading && <p className="loading-text">⏳ Generating PDF...</p>}
        {error && <div className="error-message">❌ {error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="report-info">
          <h4>📋 What's Included:</h4>
          <ul>
            <li>✓ Learning overview and statistics</li>
            <li>✓ Content breakdown by type</li>
            <li>✓ Completion status for each material</li>
            <li>✓ Progress timeline</li>
            <li>✓ Learning recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PdfReportDownloader;
