import axiosInstance, { authAxiosInstance } from './api'

// Auth Services
export const authService = {
  login: (email, password) => 
    authAxiosInstance.post('/auth/login', { email, password }),
  
  register: (name, email, password, role, teacherId) => 
    authAxiosInstance.post('/auth/register', { 
      name, 
      email, 
      password, 
      role,
      teacherId: role === 'STUDENT' ? (teacherId ? Number(teacherId) : null) : null
    }),

  getTeachers: () => authAxiosInstance.get('/auth/teachers')
}

// Teacher Services
export const teacherService = {
  getDashboard: () => axiosInstance.get('/teacher/dashboard'),
  getStudents: () => axiosInstance.get('/teacher/students'),
  getContentCompletion: (contentId) => axiosInstance.get(`/teacher/content-completion/${contentId}`),
  getStudentContentProgress: () => axiosInstance.get('/teacher/student-content-progress')
}

// Student Services
export const studentService = {
  getDashboard: () => axiosInstance.get('/dashboard/student'),
  getAssignedContent: () => axiosInstance.get('/student/assigned-content'),
  getProgress: () => axiosInstance.get('/student/progress'),
  getPersonalContent: () => axiosInstance.get('/student/personal-content'),
  markCompleted: (contentId) => axiosInstance.post(`/progress/complete/${contentId}`),
  toggleCompleted: (contentId) => axiosInstance.post(`/progress/toggle/${contentId}`),
}

// Content Services
export const contentService = {
  addContent: (title, type, url, folderId) => 
    axiosInstance.post('/content/add', { 
      title, 
      type,
      url, 
      folderId
    }),
  uploadMaterial: (formData) => 
    axiosInstance.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  downloadUploadedFile: (contentId) =>
    axiosInstance.get(`/content/file/${contentId}`, { responseType: 'blob' }),
  getTeacherContent: () => axiosInstance.get('/content/teacher'),
  getStudentPersonalContent: () => axiosInstance.get('/content/personal'),
  getContentByFolder: (folderId) => axiosInstance.get(`/content/folder/${folderId}`),
  deleteContent: (contentId) => axiosInstance.delete(`/content/${contentId}`),
  updateContent: (contentId, title, type, url) =>
    axiosInstance.put(`/content/${contentId}`, { title, type, url })
}

// Folder Services
export const folderService = {
  createFolder: (folderName) => 
    axiosInstance.post('/folder/create', { folderName }),
  getMyFolders: () => axiosInstance.get('/folder/my'),
  updateFolder: (folderId, folderName) => 
    axiosInstance.put(`/folder/update/${folderId}`, { folderName }),
  deleteFolder: (folderId) => 
    axiosInstance.delete(`/folder/delete/${folderId}`)
}

// Report Services
export const reportService = {
  getStudentReport: () => axiosInstance.get('/report/student'),
  downloadPdfReport: () => axiosInstance.get('/report/download-pdf', { responseType: 'blob' }),
  downloadDetailedPdfReport: () => axiosInstance.get('/report/download-detailed-pdf', { responseType: 'blob' })
}
