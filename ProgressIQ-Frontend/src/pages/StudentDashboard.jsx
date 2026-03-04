import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentService, contentService, folderService, reportService } from '../services/services'
import { Header, Layout, SidebarHeader, SidebarNav, NavItem, SidebarFooter, UserProfile, Sidebar } from '../components/Layout'
import { ProgressCard, Card, CardTitle, ContentCard, ChartCard } from '../components/Cards'
import { CircularProgress, LineChart } from '../components/Charts'
import { Button, Spinner, Input, Textarea, Modal, Alert } from '../components/Form'
import '../styles/global.css'
import '../styles/components.css'
import '../styles/layout.css'

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [data, setData] = useState(null)
  const [assignedContent, setAssignedContent] = useState([])
  const [personalContent, setPersonalContent] = useState([])
  const [folders, setFolders] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null) // 'folder' or 'personal'
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showRenameContentModal, setShowRenameContentModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [renameFolder, setRenameFolder] = useState({ id: null, folderName: '' })
  const [renameContent, setRenameContent] = useState({ id: null, title: '', type: '', url: '' })
  const [newFolder, setNewFolder] = useState({ folderName: '' })
  const [newContent, setNewContent] = useState({ title: '', type: 'FILE', file: null, url: '', description: '', folderId: null, contentMode: 'file' })
  const [openingContentId, setOpeningContentId] = useState(null)
  const [downloadingReportType, setDownloadingReportType] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      console.log('Loading dashboard for user:', user)
      
      const [dashboardRes, contentRes, personalRes, foldersRes, progressRes] = await Promise.all([
        studentService.getDashboard(),
        studentService.getAssignedContent(),
        studentService.getPersonalContent(),
        folderService.getMyFolders(),
        studentService.getProgress()
      ])

      console.log('Dashboard data loaded:', { dashboardRes, contentRes, personalRes, foldersRes, progressRes })
      setData(dashboardRes.data)
      setAssignedContent(contentRes.data)
      setPersonalContent(personalRes.data)
      setFolders(foldersRes.data)
      setProgress(progressRes.data)
    } catch (err) {
      console.error('Dashboard load error - Full error object:', err)
      console.error('Error response:', err.response)
      console.error('Error status:', err.response?.status)
      console.error('Error message:', err.response?.data?.message)
      
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load dashboard. Please try again.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async (contentId) => {
    try {
      await studentService.toggleCompleted(contentId)
      loadDashboard()
    } catch (err) {
      console.error('Error toggling completion status:', err)
      setError('Failed to update content status.')
    }
  }

  const handleRenameContent = async (e) => {
    e.preventDefault()
    try {
      if (!renameContent.title.trim()) {
        setError('Content title cannot be empty.')
        return
      }
      await contentService.updateContent(renameContent.id, renameContent.title, renameContent.type, renameContent.url)
      setRenameContent({ id: null, title: '', type: '', url: '' })
      setShowRenameContentModal(false)
      setError('')
      loadDashboard()
    } catch (err) {
      console.error('Error renaming content:', err)
      setError('Failed to rename content.')
    }
  }

  const handleDeleteContent = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const response = await contentService.deleteContent(contentId)
        console.log('Delete response:', response)
        setError('')
        loadDashboard()
      } catch (err) {
        console.error('Error deleting content:', err)
        console.error('Error response:', err.response?.data)
        setError(err.response?.data?.message || 'Failed to delete content.')
      }
    }
  }

  const handleViewContent = (content) => {
    if (!content) {
      setError('Unable to open this material')
      return
    }

    if (content.contentUrl) {
      const url = content.contentUrl
      if (content.contentType === 'YOUTUBE' && url.includes('watch?v=')) {
        const youtubeUrl = url.includes('embed') ? url : url.replace('watch?v=', 'embed/')
        window.open(youtubeUrl, '_blank', 'noopener,noreferrer')
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
      return
    }

    openUploadedMaterial(content)
  }

  const openUploadedMaterial = async (content) => {
    if (!content?.id) {
      setError('Invalid content reference')
      return
    }

    try {
      setOpeningContentId(content.id)
      setError('')
      const res = await contentService.downloadUploadedFile(content.id)
      const mime = res.headers?.['content-type'] || 'application/octet-stream'
      const blob = new Blob([res.data], { type: mime })
      const blobUrl = URL.createObjectURL(blob)
      window.open(blobUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    } catch (err) {
      console.error('Failed to open uploaded material', err)
      setError(err?.response?.data?.message || 'Failed to open material. Please try again.')
    } finally {
      setOpeningContentId(null)
    }
  }

  const handleCreateFolder = async (e) => {
    e.preventDefault()
    try {
      await folderService.createFolder(newFolder.folderName)
      setNewFolder({ folderName: '' })
      setShowModal(false)
      loadDashboard()
    } catch (err) {
      setError('Failed to create folder.')
    }
  }

  const handleAddContent = async (e) => {
    e.preventDefault()
    try {
      if (newContent.contentMode === 'file' && newContent.file) {
        // Upload as file (for personal materials in My Library)
        const formData = new FormData()
        formData.append('title', newContent.title)
        formData.append('file', newContent.file)
        formData.append('isPersonal', 'true')
        if (newContent.description) {
          formData.append('description', newContent.description)
        }
        if (newContent.folderId) {
          formData.append('folderId', newContent.folderId)
        }
        await contentService.uploadMaterial(formData)
      } else if (newContent.contentMode === 'url' && newContent.url) {
        // Determine content type from URL
        let contentType = 'DOCUMENT'
        if (newContent.url.includes('youtube.com') || newContent.url.includes('youtu.be')) {
          contentType = 'YOUTUBE'
        } else if (newContent.url.includes('.pdf')) {
          contentType = 'PDF'
        } else if (newContent.url.includes('.mp4') || newContent.url.includes('.webm') || newContent.url.includes('.mov')) {
          contentType = 'VIDEO'
        }
        // Add as URL-based content
        await contentService.addContent(
          newContent.title,
          contentType,
          newContent.url,
          newContent.folderId || null
        )
      } else {
        setError('Please provide either a file or a URL.')
        return
      }
      setNewContent({ title: '', type: 'FILE', file: null, url: '', description: '', folderId: null, contentMode: 'file' })
      setSelectedFolder(null)
      setShowModal(false)
      setError('')
      await loadDashboard()
    } catch (err) {
      console.error('Error adding content:', err)
      console.error('Error response:', err.response?.data)
      setError(err.response?.data?.message || 'Failed to add content.')
    }
  }

  const handleRenameFolder = async (e) => {
    e.preventDefault()
    try {
      if (!renameFolder.folderName.trim()) {
        setError('Folder name cannot be empty.')
        return
      }
      // Call API to rename folder (you may need to add this to folderService)
      await folderService.updateFolder(renameFolder.id, renameFolder.folderName)
      setRenameFolder({ id: null, folderName: '' })
      setShowRenameModal(false)
      loadDashboard()
    } catch (err) {
      setError('Failed to rename folder.')
    }
  }

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder? All materials inside will be moved to loose materials.')) {
      try {
        // Call API to delete folder (you may need to add this to folderService)
        await folderService.deleteFolder(folderId)
        setSelectedFolder(null)
        loadDashboard()
      } catch (err) {
        setError('Failed to delete folder.')
      }
    }
  }

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
      link.download = `${(user?.role || 'student').toLowerCase()}-${type}-report-${Date.now()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download report', err)
      setError('Failed to download report. Please try again.')
    } finally {
      setDownloadingReportType(null)
    }
  }

  // Calculate progress for assigned (teacher) content
  const getAssignedProgress = () => {
    if (assignedContent.length === 0) return { completed: 0, total: 0, percentage: 0 }
    const completed = assignedContent.filter(c => progress.find(p => p.contentId === c.id && p.completed)).length
    const total = assignedContent.length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { completed, total, percentage }
  }

  // Calculate progress for personal content
  const getPersonalProgress = () => {
    if (personalContent.length === 0) return { completed: 0, total: 0, percentage: 0 }
    const completed = personalContent.filter(c => progress.find(p => p.contentId === c.id && p.completed)).length
    const total = personalContent.length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { completed, total, percentage }
  }

  // Calculate overall progress
  const getOverallProgress = () => {
    const allContent = [...assignedContent, ...personalContent]
    if (allContent.length === 0) return { completed: 0, total: 0, percentage: 0 }
    const completed = allContent.filter(c => progress.find(p => p.contentId === c.id && p.completed)).length
    const total = allContent.length
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { completed, total, percentage }
  }

  const groupedAssignedContent = assignedContent.reduce((acc, content) => {
    const key = content.folder?.id ? `folder-${content.folder.id}` : 'no-folder'
    const label = content.folder?.folderName || 'Unsorted Materials'
    if (!acc[key]) {
      acc[key] = { label, items: [] }
    }
    acc[key].items.push(content)
    return acc
  }, {})

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
              icon="📚"
              label="Assigned Content"
              active={activeTab === 'assigned'}
              onClick={() => setActiveTab('assigned')}
            />
            <NavItem
              icon="✨"
              label="My Library"
              active={activeTab === 'library'}
              onClick={() => setActiveTab('library')}
            />
            <NavItem
              icon="📊"
              label="Reports"
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
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
      <Header title="Student Dashboard" />

      <div className="layout-main">
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="dashboard-overview-grid">
              <div>
                <Card>
                  <CardTitle>📈 Overall Progress</CardTitle>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--spacing-xl) 0' }}>
                    <CircularProgress
                      percentage={getOverallProgress().percentage}
                      label="Your Progress"
                      size={220}
                    />
                  </div>
                </Card>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <ProgressCard
                  title="📚 Teacher's Materials"
                  completed={getAssignedProgress().completed}
                  total={getAssignedProgress().total}
                  percentage={getAssignedProgress().percentage}
                />
                <ProgressCard
                  title="🌟 My Materials"
                  completed={getPersonalProgress().completed}
                  total={getPersonalProgress().total}
                  percentage={getPersonalProgress().percentage}
                />
                <Card className="card-sm">
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      marginTop: '0.5rem',
                      color: getOverallProgress().percentage >= 75 ? 'var(--color-success)' : getOverallProgress().percentage >= 50 ? 'var(--color-warning)' : 'var(--color-danger)'
                    }}>
                      {getOverallProgress().percentage >= 75 ? '✅ On Track' : getOverallProgress().percentage >= 50 ? '⚠️ Moderate' : '❌ Needs Help'}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {assignedContent.length > 0 && (
              <Card>
                <CardTitle>Recent Assigned Content</CardTitle>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: 'var(--spacing-lg)',
                  marginTop: 'var(--spacing-lg)'
                }}>
                  {assignedContent.slice(0, 3).map(content => {
                    const progressData = progress.find(p => p.contentId === content.id)
                    const isCompleted = progressData?.completed || false
                    
                    return (
                      <div key={content.id} style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                        position: 'relative'
                      }}>
                        {isCompleted && (
                          <div style={{
                            position: 'absolute',
                            top: 'var(--spacing-sm)',
                            right: 'var(--spacing-sm)',
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '50%',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px'
                          }}>
                          ✓
                          </div>
                        )}
                        <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
                          {content.title}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
                          {content.description || 'No description'}
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => handleMarkCompleted(content.id)}
                          style={{ width: '100%', fontSize: '0.9rem' }}
                        >
                          {isCompleted ? '✓ Done' : '📋 Mark Done'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Assigned Content Tab */}
        {activeTab === 'assigned' && (
          <Card>
            <CardTitle>Assigned Content from Teachers</CardTitle>
            {assignedContent.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', marginTop: 'var(--spacing-lg)' }}>
                {Object.entries(groupedAssignedContent).map(([key, group]) => (
                  <div key={key}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>📂 {group.label}</h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 'var(--spacing-lg)'
                    }}>
                      {group.items.map(content => {
                        const progressData = progress.find(p => p.contentId === content.id)
                        const isCompleted = progressData?.completed || false
                        const isOpening = openingContentId === content.id

                        return (
                          <div key={content.id} style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--spacing-lg)',
                            backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                            position: 'relative'
                          }}>
                            {isCompleted && (
                              <div style={{
                                position: 'absolute',
                                top: 'var(--spacing-sm)',
                                right: 'var(--spacing-sm)',
                                backgroundColor: 'var(--color-success)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '50%',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px'
                              }}>
                              ✓
                              </div>
                            )}
                            <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
                              {content.title}
                            </h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
                              {content.description || 'No description'}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                              <Button
                                variant="secondary"
                                onClick={() => (content.contentUrl ? handleViewContent(content) : openUploadedMaterial(content))}
                                style={{ flex: 1, fontSize: '0.9rem' }}
                                disabled={isOpening}
                              >
                                {isOpening ? 'Opening...' : '🔗 Open'}
                              </Button>
                              <Button
                                variant="primary"
                                onClick={() => handleMarkCompleted(content.id)}
                                style={{ flex: 1, fontSize: '0.9rem' }}
                              >
                                {isCompleted ? '✓ Done' : '📋 Mark Done'}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-lg)' }}>
                No assigned content yet. Check back soon!
              </p>
            )}
          </Card>
        )}

        {/* Library Tab - Combined Folders and Personal Content */}
        {activeTab === 'library' && (
          <div>

            <Modal
              isOpen={showModal && modalType === 'folder'}
              onClose={() => setShowModal(false)}
              title="Create Folder"
            >
              <form onSubmit={handleCreateFolder}>
                <Input
                  label="Folder Name"
                  placeholder="My Study Materials"
                  value={newFolder.folderName}
                  onChange={(e) => setNewFolder({ ...newFolder, folderName: e.target.value })}
                  required
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <Button variant="primary" type="submit">
                    Create Folder
                  </Button>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal>

            {/* Add Personal Material Modal */}
            <Modal
              isOpen={showModal && modalType === 'personal'}
              onClose={() => {
                setShowModal(false)
                setModalType(null)
              }}
              title="Add Personal Material"
            >
              <form onSubmit={handleAddContent}>
                <Input
                  label="Title"
                  placeholder="Material Title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  required
                />
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Content Type
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="contentMode"
                        value="file"
                        checked={newContent.contentMode === 'file'}
                        onChange={() => setNewContent({ ...newContent, contentMode: 'file', url: '' })}
                      />
                      <span>Upload File</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="contentMode"
                        value="url"
                        checked={newContent.contentMode === 'url'}
                        onChange={() => setNewContent({ ...newContent, contentMode: 'url', file: null })}
                      />
                      <span>Paste Link (YouTube, PDF, etc.)</span>
                    </label>
                  </div>
                </div>
                {newContent.contentMode === 'file' ? (
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Select File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewContent({ ...newContent, file: e.target.files?.[0] || null })}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    />
                    {newContent.file && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
                        ✓ {newContent.file.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <Input
                    label="Paste Link"
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/file.pdf"
                    value={newContent.url}
                    onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                  />
                )}
                <Textarea
                  label="Description (Optional)"
                  placeholder="Add a brief description of this material..."
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  rows="3"
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!newContent.title || (newContent.contentMode === 'file' ? !newContent.file : !newContent.url)}
                  >
                    Add Material
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setShowModal(false)
                    setModalType(null)
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal>

            {/* Rename Folder Modal */}
            <Modal
              isOpen={showRenameModal}
              onClose={() => {
                setShowRenameModal(false)
                setRenameFolder({ id: null, folderName: '' })
              }}
              title="Rename Folder"
            >
              <form onSubmit={handleRenameFolder}>
                <Input
                  label="New Folder Name"
                  placeholder="Enter new folder name"
                  value={renameFolder.folderName}
                  onChange={(e) => setRenameFolder({ ...renameFolder, folderName: e.target.value })}
                  required
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <Button variant="primary" type="submit">
                    Rename Folder
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setShowRenameModal(false)
                    setRenameFolder({ id: null, folderName: '' })
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal>

            {/* Add Material to Folder Modal */}
            <Modal
              isOpen={showModal && selectedFolder !== null}
              onClose={() => {
                setShowModal(false)
                setSelectedFolder(null)
              }}
              title={`Add Material to Folder`}
            >
              <form onSubmit={handleAddContent}>
                <Input
                  label="Title"
                  placeholder="Material Title"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  required
                />
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Content Type
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="contentMode"
                        value="file"
                        checked={newContent.contentMode === 'file'}
                        onChange={() => setNewContent({ ...newContent, contentMode: 'file', url: '' })}
                      />
                      <span>Upload File</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="contentMode"
                        value="url"
                        checked={newContent.contentMode === 'url'}
                        onChange={() => setNewContent({ ...newContent, contentMode: 'url', file: null })}
                      />
                      <span>Paste Link (YouTube, PDF, etc.)</span>
                    </label>
                  </div>
                </div>
                {newContent.contentMode === 'file' ? (
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Select File
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewContent({ ...newContent, file: e.target.files?.[0] || null })}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '1rem',
                        cursor: 'pointer'
                      }}
                    />
                    {newContent.file && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
                        ✓ {newContent.file.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <Input
                    label="Paste Link"
                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/file.pdf"
                    value={newContent.url}
                    onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                  />
                )}
                <Textarea
                  label="Description (Optional)"
                  placeholder="Add a brief description of this material..."
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  rows="3"
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={!newContent.title || (newContent.contentMode === 'file' ? !newContent.file : !newContent.url)}
                  >
                    Add Material
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setShowModal(false)
                    setSelectedFolder(null)
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal>

            {/* Rename Content Modal */}
            <Modal
              isOpen={showRenameContentModal}
              onClose={() => {
                setShowRenameContentModal(false)
                setRenameContent({ id: null, title: '', type: '', url: '' })
              }}
              title="Rename Material"
            >
              <form onSubmit={handleRenameContent}>
                <Input
                  label="Material Title"
                  placeholder="Enter new title"
                  value={renameContent.title}
                  onChange={(e) => setRenameContent({ ...renameContent, title: e.target.value })}
                  required
                />
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Content Type
                  </label>
                  <select
                    value={renameContent.type}
                    onChange={(e) => setRenameContent({ ...renameContent, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid var(--border-color)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="YOUTUBE">YouTube Video</option>
                    <option value="PDF">PDF Document</option>
                    <option value="VIDEO">Video File</option>
                    <option value="DOCUMENT">Document</option>
                  </select>
                </div>
                <Input
                  label="URL"
                  placeholder="https://example.com"
                  value={renameContent.url}
                  onChange={(e) => setRenameContent({ ...renameContent, url: e.target.value })}
                  required
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <Button variant="primary" type="submit">
                    Update Material
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setShowRenameContentModal(false)
                    setRenameContent({ id: null, title: '', type: '', url: '' })
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Modal>

            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                <Button
                  variant="primary"
                  onClick={() => {
                    setNewFolder({ folderName: '' })
                    setSelectedFolder(null)
                    setModalType('folder')
                    setShowModal(true)
                  }}
                >
                  📁 Create New Folder
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setNewContent({ title: '', type: 'YOUTUBE', url: '', folderId: null })
                    setSelectedFolder(null)
                    setModalType('personal')
                    setShowModal(true)
                  }}
                >
                  ➕ Add Personal Material
                </Button>
              </div>
            </div>

            {/* Folders with Contents */}
            {folders.length > 0 && (
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>📂 Organize by Folders</h3>
                {folders.map(folder => (
                  <Card key={folder.id} style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                      <CardTitle>📁 {folder.folderName}</CardTitle>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setRenameFolder({ id: folder.id, folderName: folder.folderName })
                            setShowRenameModal(true)
                          }}
                          style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: '0.9rem' }}
                        >
                          ✏️ Rename
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteFolder(folder.id)}
                          style={{ padding: 'var(--spacing-sm) var(--spacing-md)', fontSize: '0.9rem', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none' }}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => {
                        setSelectedFolder(folder.id)
                        setNewContent({ title: '', type: 'YOUTUBE', url: '', folderId: folder.id })
                        setModalType('folder')
                        setShowModal(true)
                      }}
                      style={{ marginBottom: 'var(--spacing-lg)' }}
                    >
                      ➕ Add Material to {folder.folderName}
                    </Button>

                    {personalContent && personalContent.filter(c => c.folderId === folder.id).length > 0 ? (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 'var(--spacing-lg)',
                        marginTop: 'var(--spacing-lg)'
                      }}>
                        {personalContent.filter(c => c.folderId === folder.id).map(content => {
                          const progressData = progress.find(p => p.contentId === content.id)
                          const isCompleted = progressData?.completed || false
                          
                          return (
                            <div key={content.id} style={{
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-md)',
                              padding: 'var(--spacing-lg)',
                              backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column'
                            }}>
                              {isCompleted && (
                                <div style={{
                                  position: 'absolute',
                                  top: 'var(--spacing-sm)',
                                  right: 'var(--spacing-sm)',
                                  backgroundColor: 'var(--color-success)',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '50%',
                                  fontSize: '1.1rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px'
                                }}>
                                  ✓
                                </div>
                              )}
                              <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)', wordBreak: 'break-word', paddingRight: '40px' }}>
                                {content.title}
                              </h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)', wordBreak: 'break-all' }}>
                                {content.contentType}
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                  <Button
                                    variant="primary"
                                    onClick={() => handleViewContent(content)}
                                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                                  >
                                    👁️ View
                                  </Button>
                                  <Button
                                    variant="success"
                                    onClick={() => handleMarkCompleted(content.id)}
                                    style={{ 
                                      flex: 1, 
                                      fontSize: '0.85rem',
                                      padding: '8px',
                                      backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-success)',
                                      color: 'white',
                                      border: 'none'
                                    }}
                                  >
                                    {isCompleted ? '✓ Done' : '📋 Mark Done'}
                                  </Button>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      setRenameContent({ id: content.id, title: content.title, type: content.contentType, url: content.contentUrl })
                                      setShowRenameContentModal(true)
                                    }}
                                    style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                                  >
                                    ✏️ Rename
                                  </Button>
                                  <Button
                                    variant="danger"
                                    onClick={() => handleDeleteContent(content.id)}
                                    style={{ 
                                      flex: 1, 
                                      fontSize: '0.85rem',
                                      padding: '8px',
                                      backgroundColor: 'var(--color-danger)',
                                      color: 'white',
                                      border: 'none'
                                    }}
                                  >
                                    🗑️ Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-lg)' }}>
                        No materials in this folder yet.
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardTitle>My Personal Materials</CardTitle>
              {personalContent.filter(c => !c.folderId).length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 'var(--spacing-lg)',
                  marginTop: 'var(--spacing-lg)'
                }}>
                  {personalContent.filter(c => !c.folderId).map(content => {
                    const progressData = progress.find(p => p.contentId === content.id)
                    const isCompleted = progressData?.completed || false
                    
                    return (
                      <div key={content.id} style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-secondary)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        {isCompleted && (
                          <div style={{
                            position: 'absolute',
                            top: 'var(--spacing-sm)',
                            right: 'var(--spacing-sm)',
                            backgroundColor: 'var(--color-success)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '50%',
                            fontSize: '1.1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px'
                          }}>
                          ✓
                          </div>
                        )}
                        <h4 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)', wordBreak: 'break-word', paddingRight: '40px' }}>
                          {content.title}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)', wordBreak: 'break-all' }}>
                          {content.contentType}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginTop: 'auto' }}>
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <Button
                              variant="primary"
                              onClick={() => handleViewContent(content)}
                              style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                            >
                              👁️ View
                            </Button>
                            <Button
                              variant="success"
                              onClick={() => handleMarkCompleted(content.id)}
                              style={{ 
                                flex: 1, 
                                fontSize: '0.85rem',
                                padding: '8px',
                                backgroundColor: isCompleted ? 'var(--color-success)' : 'var(--color-success)',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              {isCompleted ? '✓ Done' : '📋 Mark Done'}
                            </Button>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setRenameContent({ id: content.id, title: content.title, type: content.contentType, url: content.contentUrl })
                                setShowRenameContentModal(true)
                              }}
                              style={{ flex: 1, fontSize: '0.85rem', padding: '8px' }}
                            >
                              ✏️ Rename
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDeleteContent(content.id)}
                              style={{ 
                                flex: 1, 
                                fontSize: '0.85rem',
                                padding: '8px',
                                backgroundColor: 'var(--color-danger)',
                                color: 'white',
                                border: 'none'
                              }}
                            >
                              🗑️ Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--spacing-lg)' }}>
                  No personal materials yet. Add one to get started!
                </p>
              )}
            </Card>

            {/* Content Viewer Modal */}
            <Modal
              isOpen={showViewModal}
              onClose={() => {
                setShowViewModal(false)
                setSelectedContent(null)
              }}
              title={selectedContent?.title || 'View Material'}
            >
              {selectedContent && (
                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                    <strong>Type:</strong> {selectedContent.contentType}
                  </p>
                  {selectedContent.contentType === 'YOUTUBE' && selectedContent.contentUrl ? (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '56.25%',
                      height: 0,
                      overflow: 'hidden',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-lg)'
                    }}>
                      <iframe
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          borderRadius: 'var(--radius-md)'
                        }}
                        src={selectedContent.contentUrl.includes('embed') ? selectedContent.contentUrl : selectedContent.contentUrl.replace('watch?v=', 'embed/')}
                        title={selectedContent.title}
                        allowFullScreen
                      />
                    </div>
                  ) : selectedContent.contentType === 'PDF' && selectedContent.contentUrl ? (
                    <div style={{
                      width: '100%',
                      height: '600px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: 'var(--spacing-lg)',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {selectedContent.contentUrl.startsWith('http') ? (
                        <iframe
                          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 'var(--radius-md)' }}
                          src={`https://docs.google.com/gview?url=${selectedContent.contentUrl}&embedded=true`}
                          title={selectedContent.title}
                        />
                      ) : (
                        <a
                          href={selectedContent.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: 'var(--spacing-lg) var(--spacing-xl)',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '1.1rem'
                          }}
                        >
                          📄 Open PDF in New Tab
                        </a>
                      )}
                    </div>
                  ) : selectedContent.contentType === 'VIDEO' && selectedContent.contentUrl ? (
                    <video
                      controls
                      style={{
                        width: '100%',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-lg)',
                        backgroundColor: '#000'
                      }}
                      src={selectedContent.contentUrl}
                      title={selectedContent.title}
                    />
                  ) : selectedContent.contentUrl ? (
                    <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                        Opening link in new tab...
                      </p>
                      <a
                        href={selectedContent.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          padding: 'var(--spacing-md) var(--spacing-lg)',
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: 'var(--spacing-lg)',
                          fontSize: '1rem'
                        }}
                      >
                        🔗 Open Link
                      </a>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--color-danger)' }}>No URL available for this content</p>
                  )}
                  <div style={{
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                    wordBreak: 'break-all'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>URL:</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {selectedContent.contentUrl || 'No URL'}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowViewModal(false)
                      setSelectedContent(null)
                    }}
                    block
                  >
                    Close
                  </Button>
                </div>
              )}
            </Modal>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card>
            <CardTitle>Your Progress Report</CardTitle>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
              Download a detailed report of your learning progress and achievements.
            </p>
            <div style={{
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
            {data && (
              <div style={{ marginTop: 'var(--spacing-xl)' }}>
                <h4>Summary</h4>
                <div style={{
                  display: 'grid',
                  gap: 'var(--spacing-md)',
                  marginTop: 'var(--spacing-lg)'
                }}>
                  <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Content Assigned</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{data.totalContent}</div>
                  </div>
                  <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Content Completed</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>{data.completedContent}</div>
                  </div>
                  <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Overall Progress</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.5rem' }}>
                      {Math.round(data.progressPercentage || 0)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  )
}
