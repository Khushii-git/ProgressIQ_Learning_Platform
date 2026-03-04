import React, { useState } from 'react';
import axios from 'axios';
import '../styles/MaterialUpload.css';

const MaterialUpload = ({ folderId, onUploadSuccess, isPersonal = true }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const allowedFileTypes = [
    'application/pdf', 'video/mp4', 'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Validate file type
      if (!allowedFileTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|mp4|xls|xlsx|doc|docx|ppt|pptx|avi|mov|txt|csv)$/i)) {
        setError('Invalid file type. Allowed: PDF, Video (MP4), Excel, Word, PowerPoint');
        setFile(null);
        return;
      }

      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size exceeds 100MB limit');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('isPersonal', isPersonal);
      
      if (folderId) {
        formData.append('folderId', folderId);
      }

      const response = await axios.post('/api/content/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setSuccess(`✓ Material "${response.data.fileName}" uploaded successfully!`);
        setFile(null);
        setTitle('');
        setUploadProgress(0);

        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload material');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="material-upload-container">
      <div className="upload-card">
        <h3>📁  Add Learning Material</h3>
        
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Material Title</label>
            <input
              type="text"
              placeholder="e.g., Chapter 5 - Advanced Concepts"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>Select File</label>
            <label className="file-input-label">
              <input
                type="file"
                accept=".pdf,.mp4,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.avi,.mov,.txt,.csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <span className="file-label-text">
                {file ? `📄 ${file.name}` : '📁 Click to select file or drag & drop'}
              </span>
            </label>
            <p className="file-info">
              Supported: PDF, Excel, Word, PowerPoint, Video (MP4), Text | Max 100MB
            </p>
          </div>

          {uploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="progress-text">{uploadProgress}% uploaded...</p>
            </div>
          )}

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            type="submit"
            disabled={!file || !title || uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : '⬆️  Upload Material'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaterialUpload;
