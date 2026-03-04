import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { teacherService, folderService, contentService, reportService } from '../services/services'
import { Header, Layout, SidebarHeader, SidebarNav, NavItem, SidebarFooter, UserProfile, Sidebar } from '../components/Layout'
import { StatCard, ChartCard, Card, CardTitle } from '../components/Cards'
import { BarChart, PieChart, LineChart } from '../components/Charts'
import { Button, Spinner, Table, Modal, Input, Alert } from '../components/Form'
import { calculateProgress } from '../utils/helpers'
import '../styles/global.css'
import '../styles/components.css'
import '../styles/layout.css'

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPerformance, setFilterPerformance] = useState('all')

  // Content management state (folders + uploaded materials)
  const [folders, setFolders] = useState([])
  const [teacherContent, setTeacherContent] = useState([])
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState('')

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)

  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadFolderId, setUploadFolderId] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFolderFilter, setSelectedFolderFilter] = useState('all')
  const [openingContentId, setOpeningContentId] = useState(null)
  const [deletingFolderId, setDeletingFolderId] = useState(null)
  const [downloadingReportType, setDownloadingReportType] = useState(null)

  // Progress tracker state
  const [progressData, setProgressData] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState('')
  const [expandedStudent, setExpandedStudent] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (activeTab === 'content') {
      loadContentManagement()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'progress') {
      loadProgressData()
    }
  }, [activeTab])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await teacherService.getDashboard()
      setData(response.data)
    } catch (err) {
      setError('Failed to load dashboard. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadContentManagement = async () => {
    try {
      setContentLoading(true)
      setContentError('')

      const [foldersRes, contentRes] = await Promise.all([
        folderService.getMyFolders(),
        contentService.getTeacherContent()
      ])

      setFolders(Array.isArray(foldersRes.data) ? foldersRes.data : [])
      setTeacherContent(Array.isArray(contentRes.data) ? contentRes.data : [])
    } catch (err) {
      console.error(err)
      setContentError(err?.response?.data?.message || 'Failed to load folders/materials. Please try again.')
    } finally {
      setContentLoading(false)
    }
  }

  const loadProgressData = async () => {
    try {
      setProgressLoading(true)
      setProgressError('')
      const response = await teacherService.getStudentContentProgress()
      setProgressData(response.data)
    } catch (err) {
      console.error(err)
      setProgressError('Failed to load progress data. Please try again.')
    } finally {
      setProgressLoading(false)
    }
  }

  const handleCreateFolder = async () => {
    const trimmed = newFolderName.trim()
    if (!trimmed) {
      setContentError('Folder name is required.')
      return
    }

    try {
      setCreatingFolder(true)
      setContentError('')
      await folderService.createFolder(trimmed)
      setNewFolderName('')
      setShowCreateFolderModal(false)
      await loadContentManagement()
    } catch (err) {
      console.error(err)
      setContentError(err?.response?.data?.message || 'Failed to create folder. Please try again.')
    } finally {
      setCreatingFolder(false)
    }
  }

  const handleUploadMaterial = async () => {
    if (!uploadTitle.trim()) {
      setContentError('Title is required for upload.')
      return
    }
    if (!uploadFile) {
      setContentError('Please choose a file to upload.')
      return
    }

    try {
      setUploading(true)
      setContentError('')

      const formData = new FormData()
      formData.append('title', uploadTitle.trim())
      formData.append('file', uploadFile)
      // Teacher content should be non-personal so it appears in /content/teacher
      formData.append('isPersonal', 'false')
      if (uploadFolderId) {
        formData.append('folderId', uploadFolderId)
      }

      await contentService.uploadMaterial(formData)

      setUploadTitle('')
      setUploadFile(null)
      setUploadFolderId('')

      await loadContentManagement()
      // Refresh analytics too (optional but keeps dashboard consistent)
      await loadDashboard()
    } catch (err) {
      console.error(err)
      setContentError(err?.response?.data?.message || err?.response?.data?.error || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteContent = async (contentId) => {
    if (!contentId) return

    try {
      setContentLoading(true)
      setContentError('')
      await contentService.deleteContent(contentId)
      await loadContentManagement()
      await loadDashboard()
    } catch (err) {
      console.error(err)
      setContentError(err?.response?.data?.message || 'Failed to delete content. Please try again.')
    } finally {
      setContentLoading(false)
    }
  }

  const handleDeleteFolder = async (folderId) => {
    if (!folderId) return
    const confirmDelete = window.confirm('Delete this folder? Materials inside will move to "No Folder".')
    if (!confirmDelete) return

    try {
      setDeletingFolderId(folderId)
      setContentError('')
      await folderService.deleteFolder(folderId)

      if (String(selectedFolderFilter) === String(folderId)) {
        setSelectedFolderFilter('all')
      }
      if (String(uploadFolderId) === String(folderId)) {
        setUploadFolderId('')
      }

      await loadContentManagement()
    } catch (err) {
      console.error(err)
      setContentError(err?.response?.data?.message || 'Failed to delete folder. Please try again.')
    } finally {
      setDeletingFolderId(null)
    }
  }

  const handleOpenContent = async (content) => {
    if (!content) return

    // If it's a URL-based content, open directly.
    if (content.contentUrl) {
      window.open(content.contentUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // If it's an uploaded file, download it with JWT and open.
    try {
      setOpeningContentId(content.id)
      setContentError('')
      const res = await contentService.downloadUploadedFile(content.id)

      const mime = res.headers?.['content-type'] || 'application/octet-stream'
      const blob = new Blob([res.data], { type: mime })
      const blobUrl = URL.createObjectURL(blob)

      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      // Revoke later to avoid breaking the opened tab immediately
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (err) {
      console.error(err)
      setContentError(err?.response?.data?.message || 'Failed to open file. Please try again.')
    } finally {
      setOpeningContentId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Spinner />
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: 'var(--spacing-xl)' }}>
        <Alert type="danger" message={error} onClose={() => setError('')} />
      </div>
    )
  }

  // Filter students based on search and performance
  let filteredStudents = data.students || []
  if (searchTerm) {
    filteredStudents = filteredStudents.filter(s =>
      s.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
  if (filterPerformance !== 'all') {
    filteredStudents = filteredStudents.filter(s => {
      const progress = s.progressPercentage || 0
      if (filterPerformance === 'high') return progress >= 75
      if (filterPerformance === 'medium') return progress >= 50 && progress < 75
      if (filterPerformance === 'low') return progress < 50
      return true
    })
  }

  // Prepare chart data
  const contentLabels = data.contentAnalytics?.map(c => c.title) || []
  const contentCompletion = data.contentAnalytics?.map(c => c.completedCount) || []
  const contentTotal = data.contentAnalytics?.map(c => c.totalAssigned) || []

  const studentLabels = data.students?.map(s => s.studentName) || []
  const studentProgress = data.students?.map(s => s.progressPercentage || 0) || []

  const handleDownloadReport = async (type = 'summary') => {
    try {
      setDownloadingReportType(type)
      const apiCall = type === 'detailed'
        ? reportService.downloadDetailedPdfReport
        : reportService.downloadPdfReport

      const response = await apiCall()
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${(user?.role || 'teacher').toLowerCase()}-${type}-report-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      setError('Failed to download the report. Please try again.')
    } finally {
      setDownloadingReportType(null)
    }
  }

  const filteredTeacherContent = (teacherContent || []).filter((item) => {
    if (selectedFolderFilter === 'all') return true
    if (selectedFolderFilter === 'none') return !item.folder
    return String(item.folder?.id) === String(selectedFolderFilter)
  })

  const selectedFolderName = selectedFolderFilter === 'all'
    ? 'All Materials'
    : selectedFolderFilter === 'none'
      ? 'No Folder'
      : (folders || []).find(f => String(f.id) === String(selectedFolderFilter))?.folderName || 'Folder'

  return (
    <Layout
      sidebar={
        <Sidebar>
          <SidebarHeader />
          <SidebarNav>
            <NavItem
              icon="📈"
              label="Overview"
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <NavItem
              icon="👥"
              label="Students"
              active={activeTab === 'students'}
              onClick={() => setActiveTab('students')}
            />
            <NavItem
              icon="✅"
              label="Progress"
              active={activeTab === 'progress'}
              onClick={() => setActiveTab('progress')}
            />
            <NavItem
              icon="📚"
              label="Content"
              active={activeTab === 'content'}
              onClick={() => setActiveTab('content')}
            />
            <NavItem
              icon="📊"
              label="Analytics"
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
          </SidebarNav>
          <SidebarFooter>
            <UserProfile user={user} />
            <Button variant="secondary" block onClick={logout}>
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Header title="Teacher Dashboard" />

      <div className="layout-main">
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <StatCard
                title="Total Students"
                value={data.totalStudents}
                icon="👥"
                color="primary"
              />
              <StatCard
                title="Total Content"
                value={data.totalContent}
                icon="📚"
                color="success"
              />
              <StatCard
                title="Avg Progress"
                value={`${Math.round(data.students?.reduce((sum, s) => sum + (s.progressPercentage || 0), 0) / (data.students?.length || 1)) || 0}%`}
                icon="📈"
                color="info"
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              <ChartCard title="Student Progress Distribution">
                {studentLabels.length > 0 ? (
                  <LineChart
                    labels={studentLabels}
                    datasets={[{
                      label: 'Progress %',
                      data: studentProgress
                    }]}
                  />
                ) : (
                  <p>No data available</p>
                )}
              </ChartCard>
              <ChartCard title="Content Completion">
                {contentLabels.length > 0 ? (
                  <BarChart
                    labels={contentLabels}
                    datasets={[{
                      label: 'Completed',
                      data: contentCompletion
                    }]}
                  />
                ) : (
                  <p>No data available</p>
                )}
              </ChartCard>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div>
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                onChange={(e) => setFilterPerformance(e.target.value)}
                className="input-group"
                style={{
                  padding: 'var(--spacing-md)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Performance</option>
                <option value="high">High (75%+)</option>
                <option value="medium">Medium (50-75%)</option>
                <option value="low">Low (&lt;50%)</option>
              </select>
            </div>

            <Card>
              <Table
                headers={['Name', 'Email', 'Progress', 'Status']}
                rows={filteredStudents.map(s => [
                  s.studentName,
                  s.studentEmail,
                  `${s.progressPercentage || 0}%`,
                  s.progressPercentage >= 75 ? '✅ On Track' : s.progressPercentage >= 50 ? '⚠️ Moderate' : '❌ Needs Help'
                ])}
              />
            </Card>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Showing {filteredStudents.length} of {data.students?.length} students</p>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div>
            {(contentError || error) && (
              <Alert
                type="danger"
                message={contentError || error}
                onClose={() => {
                  setContentError('')
                  setError('')
                }}
              />
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-lg)'
              }}
            >
              <Card>
                <CardTitle>Folders</CardTitle>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center', marginTop: 'var(--spacing-lg)' }}>
                  <Button variant="primary" onClick={() => setShowCreateFolderModal(true)}>
                    ➕ Create Folder
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginTop: 'var(--spacing-lg)' }}>
                  {(folders || []).map((f) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <Button
                        variant={String(selectedFolderFilter) === String(f.id) ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          setSelectedFolderFilter(String(f.id))
                          setUploadFolderId(String(f.id))
                        }}
                      >
                        📂 {f.folderName}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={deletingFolderId === f.id}
                        onClick={() => handleDeleteFolder(f.id)}
                        title="Delete folder"
                      >
                        {deletingFolderId === f.id ? '...' : '🗑️'}
                      </Button>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
                  {(folders || []).length === 0 ? (
                    <p style={{ margin: 0 }}>No folders yet.</p>
                  ) : (
                    <p style={{ margin: 0 }}>You have {(folders || []).length} folder(s).</p>
                  )}
                </div>
              </Card>

              <Card>
                <CardTitle>Upload Material</CardTitle>
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <Input
                    label="Title"
                    placeholder="e.g., Week 1 Notes"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />

                  <div className="input-group">
                    <label>File</label>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Folder (optional)</label>
                    <select value={uploadFolderId} onChange={(e) => setUploadFolderId(e.target.value)}>
                      <option value="">No folder</option>
                      {(folders || []).map((f) => (
                        <option key={f.id} value={String(f.id)}>
                          {f.folderName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button variant="primary" onClick={handleUploadMaterial} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </Card>
            </div>

            <Card>
              <CardTitle>Content Analytics</CardTitle>
              <div style={{
                display: 'grid',
                gap: 'var(--spacing-md)',
                marginTop: 'var(--spacing-lg)'
              }}>
                {data.contentAnalytics && data.contentAnalytics.length > 0 ? (
                  data.contentAnalytics.map(content => (
                    <div
                      key={content.id}
                      style={{
                        padding: 'var(--spacing-lg)',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{content.title}</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          {content.completedCount}/{content.totalAssigned} students completed
                        </p>
                        <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${calculateProgress(content.completedCount, content.totalAssigned)}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No content available</p>
                )}
              </div>
            </Card>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <Card>
                <CardTitle>{selectedFolderName}</CardTitle>

                {contentLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-xl)' }}>
                    <Spinner />
                  </div>
                ) : (
                  <Table
                    headers={['Title', 'File / URL', 'Folder', 'Type', 'Actions']}
                    rows={filteredTeacherContent.map((c) => [
                      <button
                        key={`open-title-${c.id}`}
                        onClick={() => handleOpenContent(c)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          color: 'var(--color-primary)',
                          textAlign: 'left'
                        }}
                      >
                        {c.title}
                      </button>,
                      c.fileName || c.contentUrl || '-',
                      c.folder?.folderName || '-',
                      c.contentType || '-',
                      <div key={`actions-${c.id}`} style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={openingContentId === c.id}
                          onClick={() => handleOpenContent(c)}
                        >
                          {openingContentId === c.id ? 'Opening...' : 'Open'}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDeleteContent(c.id)}>
                          Delete
                        </Button>
                      </div>
                    ])}
                  />
                )}
              </Card>
            </div>

            <Modal
              isOpen={showCreateFolderModal}
              onClose={() => setShowCreateFolderModal(false)}
              title="Create Folder"
              size="sm"
            >
              <Input
                label="Folder Name"
                placeholder="e.g., Math"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setShowCreateFolderModal(false)} disabled={creatingFolder}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleCreateFolder} disabled={creatingFolder}>
                  {creatingFolder ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </Modal>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{
              marginBottom: 'var(--spacing-lg)',
              display: 'flex',
              gap: 'var(--spacing-md)',
              flexWrap: 'wrap'
            }}>
              <Button
                variant="secondary"
                disabled={!!downloadingReportType}
                onClick={() => handleDownloadReport('summary')}
              >
                {downloadingReportType === 'summary' ? 'Preparing...' : '📄 Summary PDF'}
              </Button>
              <Button
                variant="primary"
                disabled={!!downloadingReportType}
                onClick={() => handleDownloadReport('detailed')}
              >
                {downloadingReportType === 'detailed' ? 'Rendering Charts...' : '📊 Visual PDF Report'}
              </Button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 'var(--spacing-lg)'
            }}>
              <ChartCard title="Student Performance Distribution">
                {data.students && data.students.length > 0 ? (
                  <PieChart
                    labels={[
                      `High (${data.students.filter(s => (s.progressPercentage || 0) >= 75).length})`,
                      `Medium (${data.students.filter(s => (s.progressPercentage || 0) >= 50 && (s.progressPercentage || 0) < 75).length})`,
                      `Low (${data.students.filter(s => (s.progressPercentage || 0) < 50).length})`
                    ]}
                    data={[
                      data.students.filter(s => (s.progressPercentage || 0) >= 75).length,
                      data.students.filter(s => (s.progressPercentage || 0) >= 50 && (s.progressPercentage || 0) < 75).length,
                      data.students.filter(s => (s.progressPercentage || 0) < 50).length
                    ]}
                  />
                ) : (
                  <p>No data available</p>
                )}
              </ChartCard>
              <ChartCard title="Content Assignment Completion">
                {contentLabels.length > 0 ? (
                  <PieChart
                    labels={contentLabels}
                    data={contentCompletion}
                  />
                ) : (
                  <p>No data available</p>
                )}
              </ChartCard>
            </div>
          </div>
        )}

        {/* Progress Tracker Tab */}
        {activeTab === 'progress' && (
          <div>
            {progressError && <Alert type="danger" message={progressError} onClose={() => setProgressError('')} />}
            
            {progressLoading ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                <Spinner />
              </div>
            ) : progressData && progressData.students && progressData.students.length > 0 ? (
              <>
                {/* Progress Summary Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--spacing-lg)',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  <StatCard
                    icon="👥"
                    title="Total Students"
                    value={progressData.totalStudents || 0}
                    color="var(--color-primary)"
                  />
                  <StatCard
                    icon="📚"
                    title="Total Content"
                    value={progressData.totalContent || 0}
                    color="var(--color-secondary)"
                  />
                  <StatCard
                    icon="✅"
                    title="Class Average"
                    value={`${(progressData.averageCompletion || 0).toFixed(1)}%`}
                    color="var(--color-success)"
                  />
                </div>

                {/* Student-by-Content Progress Matrix */}
                <Card>
                  <CardTitle>Student Progress Tracker</CardTitle>
                  <div style={{
                    overflowX: 'auto',
                    marginTop: 'var(--spacing-md)'
                  }}>
                    <table style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: '0.9rem'
                    }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'left',
                            backgroundColor: 'var(--bg-secondary)',
                            fontWeight: '600'
                          }}>
                            Student
                          </th>
                          <th style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-secondary)',
                            fontWeight: '600'
                          }}>
                            Overall Progress
                          </th>
                          <th style={{
                            padding: 'var(--spacing-md)',
                            textAlign: 'center',
                            backgroundColor: 'var(--bg-secondary)',
                            fontWeight: '600'
                          }}>
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {progressData.students.map((student) => (
                          <React.Fragment key={student.studentId}>
                            <tr style={{
                              borderBottom: '1px solid var(--border-color)',
                              backgroundColor: expandedStudent === student.studentId ? 'var(--bg-secondary)' : 'transparent'
                            }}>
                              <td style={{
                                padding: 'var(--spacing-md)',
                              }}>
                                <div>
                                  <div style={{ fontWeight: '500' }}>{student.studentName}</div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{student.studentEmail}</div>
                                </div>
                              </td>
                              <td style={{
                                padding: 'var(--spacing-md)',
                                textAlign: 'center'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 'var(--spacing-sm)'
                                }}>
                                  <div style={{
                                    width: '100px',
                                    height: '6px',
                                    backgroundColor: 'var(--border-color)',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                  }}>
                                    <div style={{
                                      height: '100%',
                                      width: `${student.overallProgress}%`,
                                      backgroundColor: student.overallProgress >= 75 ? '#4CAF50' : student.overallProgress >= 50 ? '#FFC107' : '#f44336',
                                      transition: 'width 0.3s ease'
                                    }} />
                                  </div>
                                  <span style={{ fontWeight: '600', minWidth: '45px' }}>
                                    {student.overallProgress.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', padding: 'var(--spacing-md)' }}>
                                <Button
                                  variant="secondary"
                                  onClick={() => setExpandedStudent(expandedStudent === student.studentId ? null : student.studentId)}
                                  style={{ fontSize: '0.85rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                                >
                                  {expandedStudent === student.studentId ? 'Hide' : 'Show'}
                                </Button>
                              </td>
                            </tr>
                            {expandedStudent === student.studentId && (
                              <tr>
                                <td colSpan="3" style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--bg-secondary)' }}>
                                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <h4 style={{ margin: '0 0 var(--spacing-md) 0', color: 'var(--text-primary)' }}>Content Completion Details</h4>
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                      gap: 'var(--spacing-md)'
                                    }}>
                                      {student.contentProgress.map((content) => (
                                        <div
                                          key={content.contentId}
                                          style={{
                                            padding: 'var(--spacing-md)',
                                            border: `2px solid ${content.completed ? '#4CAF50' : 'var(--border-color)'}`,
                                            borderRadius: 'var(--border-radius)',
                                            backgroundColor: content.completed ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                                          }}
                                        >
                                          <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-sm)',
                                            marginBottom: 'var(--spacing-sm)'
                                          }}>
                                            <span style={{ fontSize: '1.2rem' }}>
                                              {content.completed ? '✅' : '⭕'}
                                            </span>
                                            <div>
                                              <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                                                {content.contentTitle}
                                              </div>
                                              <div style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--text-secondary)'
                                              }}>
                                                {content.contentType}
                                              </div>
                                            </div>
                                          </div>
                                          {content.completed && content.completedAt && (
                                            <div style={{
                                              fontSize: '0.8rem',
                                              color: 'var(--text-secondary)',
                                              paddingLeft: '1.8rem'
                                            }}>
                                              ✓ Completed: {new Date(content.completedAt).toLocaleDateString()}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : (
              <Card>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No students assigned yet. Assign students to view their progress.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
