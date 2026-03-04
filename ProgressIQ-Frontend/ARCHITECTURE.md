# Architecture & API Integration Guide

## Backend Integration Map

This document maps frontend components to backend endpoints.

## User Authentication Flow

```
[Login Form] -> POST /auth/login
                    ↓
                [JWT Token + User Data]
                    ↓
            [localStorage stored]
                    ↓
         [Route protection applied]
                    ↓
        [User redirected to dashboard]
```

### Login Process
```javascript
// LoginPage.jsx
const handleSubmit = async (e) => {
  const response = await authService.login(email, password)
  // response.data = { token, user: { id, username, email, role } }
  login(user, token)  // AuthContext saves to localStorage
  navigate(user.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard')
}
```

### Registration Process
```javascript
// RegisterPage.jsx
const handleSubmit = async (e) => {
  await authService.register(username, email, password, role)
  // Redirects to login page
  navigate('/login')
}
```

## Teacher Dashboard Integration

### Data Flow
```
[TeacherDashboard Mount]
        ↓
[teacherService.getDashboard()]
        ↓
GET /teacher/dashboard
        ↓
[TeacherDashboardResponse: {
  totalStudents: long,
  totalContent: long,
  students: [StudentSummaryResponse],
  contentAnalytics: [ContentAnalyticsResponse]
}]
        ↓
[Update state with data]
        ↓
[Render tabs: Overview, Students, Content, Analytics]
```

### API Endpoints Used
1. **Dashboard Data**: `GET /teacher/dashboard`
   - Returns: total students, content, student list, content analytics
   
2. **Student Details**: `GET /teacher/students`
   - Returns: list of students with progress percentages
   
3. **Content Completion**: `GET /teacher/content-completion/{contentId}`
   - Returns: completion count for specific content

### Features Implemented
- **Overview Tab**: Stats cards, progress charts, content completion
- **Students Tab**: Search, filter by performance, status indicators
- **Content Tab**: List of all content with completion rates
- **Analytics Tab**: Pie charts, performance distribution, report download

### Sample API Response Structure
```javascript
{
  totalStudents: 25,
  totalContent: 12,
  students: [
    {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      progressPercentage: 75.5
    }
  ],
  contentAnalytics: [
    {
      id: 1,
      title: "Python Basics",
      completedCount: 18,
      totalAssigned: 25
    }
  ]
}
```

## Student Dashboard Integration

### Data Flow
```
[StudentDashboard Mount]
        ↓
[Parallel API calls]
        ├─ studentService.getDashboard()
        ├─ studentService.getAssignedContent()
        ├─ studentService.getPersonalContent()
        └─ folderService.getMyFolders()
        ↓
[Combine responses]
        ↓
[Update state]
        ↓
[Render tabs: Overview, Assigned, Personal, Folders, Reports]
```

### API Endpoints Used
1. **Dashboard**: `GET /dashboard/student`
   - Returns: DashboardResponse with total/completed content and progress %
   
2. **Assigned Content**: `GET /student/assigned-content`
   - Returns: List<Content> - teacher assigned content
   
3. **Progress**: `GET /student/progress`
   - Returns: List<StudentProgressResponse> - progress per content
   
4. **Personal Content**: `GET /student/personal-content`
   - Returns: List<Content> - user's own materials
   
5. **Mark Completed**: `POST /progress/complete/{contentId}`
   - Request: contentId (path param)
   - Response: "Content marked as completed"
   
6. **Generate Report**: `GET /report/student`
   - Returns: Map<String, Object> - detailed report data
   
7. **Folders**: `GET /folder/my`
   - Returns: List<Folder> - user's folders

### Sample API Response Structure
```javascript
// Dashboard Response
{
  totalContent: 15,
  completedContent: 10,
  progressPercentage: 66.67
}

// Assigned Content
[
  {
    id: 1,
    title: "Python Fundamentals",
    description: "Learn Python basics",
    url: "https://example.com/python",
    isPersonal: false
  }
]

// Student Progress
[
  {
    contentId: 1,
    contentTitle: "Python Fundamentals",
    isCompleted: false,
    completedAt: null
  }
]
```

## Content Management Integration

### Add Content (Student)
```javascript
// StudentDashboard.jsx - "Add New Material"
const handleAddContent = async (e) => {
  await contentService.addContent(
    title,           // string
    description,     // string
    url,            // string (external link)
    folderId,       // number or null
    true            // isPersonal = true for student
  )
}

// Endpoint: POST /content/add
// Request: {
//   title, description, url, folderId, isPersonal
// }
// Response: Content { id, title, ... }
```

### Add Content (Teacher)
```javascript
// Teachers can add content through similar endpoint
// Endpoint: POST /content/add
// With: isPersonal = false
```

### Retrieve Content
```javascript
// Teacher's content
const teacherContent = await contentService.getTeacherContent()
// GET /content/teacher

// Student's personal content
const personalContent = await contentService.getStudentPersonalContent()
// GET /content/personal
```

## Folder Management Integration

### Create Folder
```javascript
// StudentDashboard.jsx - "Create New Folder"
const handleCreateFolder = async () => {
  await folderService.createFolder(
    name,        // string: "My Study Materials"
    description  // string: "Organized notes and resources"
  )
}

// Endpoint: POST /folder/create
// Request: { name, description }
// Response: Folder { id, name, description, createdAt }
```

### Retrieve Folders
```javascript
const folders = await folderService.getMyFolders()
// GET /folder/my
// Returns: List<Folder>
```

## State Management Architecture

### AuthContext
```javascript
{
  user: { id, username, email, role },
  token: "jwt_token_here",
  isAuthenticated: boolean,
  loading: boolean,
  login: (user, token) => void,
  logout: () => void
}
```

### ThemeContext
```javascript
{
  isDark: boolean,
  toggleTheme: () => void
}
```

### Component State Examples
```javascript
// TeacherDashboard
const [data, setData] = useState(null)           // API response
const [activeTab, setActiveTab] = useState('overview')
const [searchTerm, setSearchTerm] = useState('')
const [filterPerformance, setFilterPerformance] = useState('all')

// StudentDashboard
const [data, setData] = useState(null)
const [assignedContent, setAssignedContent] = useState([])
const [personalContent, setPersonalContent] = useState([])
const [folders, setFolders] = useState([])
```

## Error Handling Flow

```
[API Call]
    ↓
[Success] ──→ [Update state] ──→ [Re-render]
    ↓
[401 Unauthorized] ──→ [Clear token] ──→ [Redirect to /login]
    ↓
[Other Error] ──→ [Set error state] ──→ [Show Alert component]
```

### Implementation
```javascript
try {
  const response = await teacherService.getDashboard()
  setData(response.data)
} catch (err) {
  if (err.response?.status === 401) {
    logout()
    navigate('/login')
  } else {
    setError('Failed to load dashboard')
  }
}
```

## API Request/Response Structure

### All Requests Include
```javascript
// Header automatically added by axios interceptor
{
  Authorization: `Bearer ${token}`,
  Content-Type: 'application/json'
}
```

### Success Response Format
```javascript
{
  status: 200,
  data: {
    // Response specific data
  }
}
```

### Error Response Format
```javascript
{
  status: 400/401/500,
  data: {
    message: "Error description"
  }
}
```

## Performance Considerations

1. **Parallel API Calls**: Student dashboard loads all data in parallel
2. **Lazy Loading**: Routes loaded only when navigated
3. **Memoization**: Components wrapped with React.memo where needed
4. **Debouncing**: Search input debounced to avoid excessive API calls
5. **Caching**: API responses stored in component state, refetch on manual refresh

## Security Implementation

1. **JWT Storage**: Token stored in localStorage
2. **Auto-logout**: 401 response triggers logout automatically
3. **Route Protection**: Private and role-based routes prevent unauthorized access
4. **CORS**: Backend configured to accept frontend origin
5. **HTTPS**: Production environment should use HTTPS with secure cookies

## Deployment Checklist

- [ ] Update `VITE_API_BASE_URL` to production backend URL
- [ ] Run `npm run build` to create production bundle
- [ ] Test all authentication flows
- [ ] Verify API endpoints work with production backend
- [ ] Test dark/light theme persistence
- [ ] Verify report downloads work
- [ ] Check responsive design on mobile
- [ ] Test on different browsers
- [ ] Configure CORS on backend for production domain
- [ ] Set up error logging/monitoring
