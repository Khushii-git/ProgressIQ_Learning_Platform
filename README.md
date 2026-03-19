# ProgressIQ Learning System

A comprehensive learning management system that tracks student progress with real-time analytics and detailed completion insights for teachers.

## 🎯 Features

### For Teachers
- **Dashboard Overview**: Real-time statistics on student engagement and progress
- **Student Progress Tracking**: See exactly which students completed which content
- **Content Management**: Upload and organize learning materials into folders
- **Individual Student Analytics**: Detailed completion history with timestamps
- **Progress Reports**: Generate comprehensive PDF reports

### For Students
- **Personalized Dashboard**: Track your own learning progress
- **Progress Indicators**: Visual completion rates for all assigned content
- **Content Library**: Access materials organized by folders
- **Personal Materials**: Upload and manage your own learning resources
- **Learning History**: View completion dates and progress timeline

## 🔐 Security Features

- **HTTPOnly Cookies**: Secure token storage preventing XSS attacks
- **JWT Authentication**: Industry-standard token-based authentication
- **Role-Based Access Control**: Student and Teacher roles with specific permissions
- **Password Encryption**: BCrypt hashing with strong security standards
- **Input Validation**: All fields validated for data integrity
- **Token Expiration**: 1-hour access tokens + 7-day refresh tokens
- **CORS Protection**: Restricted to authorized origins only
- **SessionStorage**: Refresh tokens securely stored client-side

## 🏗️ Architecture

### Project Structure

```
ProgressIQ-Education-System/
├── ES_Backend/                  # Spring Boot 4.0.3 REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/
│   │   │   │   ├── controller/    # REST endpoints
│   │   │   │   ├── service/       # Business logic
│   │   │   │   ├── entity/        # JPA models
│   │   │   │   ├── repository/    # Data access
│   │   │   │   ├── security/      # JWT & auth
│   │   │   │   └── config/        # Security config
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
└── ProgressIQ-Frontend/         # React + Vite frontend
    ├── src/
    │   ├── pages/               # Page components
    │   ├── components/          # Reusable components
    │   ├── services/            # API calls
    │   ├── context/             # Global state
    │   ├── styles/              # CSS files
    │   └── utils/               # Helper functions
    ├── package.json
    └── vite.config.js
```

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER (Browser)                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                  React 18 + Vite Frontend                             │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────┐ │  │
│  │  │   LoginPage      │  │ TeacherDashboard │  │  StudentDashboard   │ │  │
│  │  │  RegisterPage    │  │   (Progress Tab) │  │  (Progress Tracking)│ │  │
│  │  └──────────────────┘  └──────────────────┘  └─────────────────────┘ │  │
│  │            │                    │                        │             │  │
│  │            └────────────────────┼────────────────────────┘             │  │
│  │                                 ▼                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │           Axios Instance (API Client)                           │ │  │
│  │  │   - AuthAxiosInstance: /auth endpoints (withCredentials)        │ │  │
│  │  │   - AxiosInstance: /api endpoints (token refresh interceptor)   │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  │                                 │                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │  │
│  │  │           AuthContext + ThemeContext (Global State)             │ │  │
│  │  │   - User info, tokens, theme settings                           │ │  │
│  │  └──────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────┬────────────────────────────────────────────────────────────────────┬─┘
        │ HTTPS/HTTP Requests (JSON)                                         │
        │ HTTPOnly Cookies (JWT Tokens)                                      │
        │ Authorization Headers (Bearer Token)                               │
        ▼                                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    API LAYER (Spring Boot 4.0.3)                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      CORS Config                                      │  │
│  │  - Origins: localhost:*, 127.0.0.1:*                                 │  │
│  │  - Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS                   │  │
│  │  - Credentials: allowed (HTTPOnly cookies + CORS token)              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                 │                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      JWT Security Filter                              │  │
│  │  - Validates JWT signature (HS256)                                    │  │
│  │  - Extracts email & role from token                                   │  │
│  │  - Sets SecurityContext for @Principal                               │  │
│  │  - Handles HTTPOnly cookie extraction                                 │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                 │                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    REST Controllers (Endpoints)                       │  │
│  │  ┌──────────────┐  ┌────────────────┐  ┌──────────────────────────┐ │  │
│  │  │ AuthController│  │TeacherController│ │StudentController        │ │  │
│  │  │- /login      │  │- /dashboard    │ │- /dashboard              │ │  │
│  │  │- /register   │  │- /students     │ │- /assigned-content       │ │  │
│  │  │- /refresh    │  │- /student-     │ │- /progress               │ │  │
│  │  │- /logout     │  │  content-prog  │ │- /mark-complete/{id}    │ │  │
│  │  └──────────────┘  └────────────────┘  └──────────────────────────┘ │  │
│  │               ┌─────────────────────────────────────────────┐         │  │
│  │               │      ContentController FolderController     │         │  │
│  │               │      DashboardController                    │         │  │
│  │               │      ProgressController                     │         │  │
│  │               └─────────────────────────────────────────────┘         │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                 │                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              Service Layer (Business Logic)                           │  │
│  │  ┌──────────────────────┐  ┌────────────────────────────────────┐   │  │
│  │  │  AuthenticationService│  │      TeacherService              │   │  │
│  │  │  - Login/Register    │  │  - getStudentContentProgress()   │   │  │
│  │  │  - Token generation  │  │  - getDashboard()                │   │  │
│  │  │  - Token validation  │  │  - Get assigned students         │   │  │
│  │  └──────────────────────┘  └────────────────────────────────────┘   │  │
│  │  ┌──────────────────────┐  ┌────────────────────────────────────┐   │  │
│  │  │  StudentService      │  │      ContentService               │   │  │
│  │  │  - getProgress()     │  │  - Upload content                 │   │  │
│  │  │  - markComplete()    │  │  - Manage folders                 │   │  │
│  │  │  - getDashboard()    │  │  - Get user content              │   │  │
│  │  └──────────────────────┘  └────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                 │                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │           Repository Layer (JPA Data Access)                         │  │
│  │  UserRepository │ ContentRepository │ ProgressRepository            │  │
│  │  FolderRepository │ RefreshTokenRepository │ MappingRepository      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└───────┬────────────────────────────────────────────────────────────────────┬─┘
        │ SQL Queries (SELECT, INSERT, UPDATE, DELETE)                       │
        │ JPA/Hibernate ORM                                                  │
        ▼                                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (MySQL 8.0.41)                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Tables:                                                              │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │  │
│  │  │   USER (PK: id) │  │CONTENT  (PK: id) │  │PROGRESS (PK: id)│   │  │
│  │  │- email (UNIQUE) │  │- title           │  │- user_id (FK)   │   │  │
│  │  │- password       │  │- type            │  │- content_id (FK)│   │  │
│  │  │- role           │  │- uploaded_by(FK) │  │- completed      │   │  │
│  │  │- created_at     │  │- file_path       │  │- completed_at   │   │  │
│  │  └─────────────────┘  │- created_at      │  └──────────────────┘   │  │
│  │  ┌──────────────────┐  └──────────────────┘  ┌──────────────────┐   │  │
│  │  │REFRESHTOKEN      │  ┌──────────────────┐  │FOLDER (PK: id)  │   │  │
│  │  │(PK: id)          │  │MAPPING (PK: id) │  │- name            │   │  │
│  │  │- user_id (FK)    │  │- student_id(FK) │  │- created_by(FK)  │   │  │
│  │  │- token           │  │- teacher_id(FK) │  │- created_at      │   │  │
│  │  │- expires_at      │  └──────────────────┘  └──────────────────┘   │  │
│  │  │- is_revoked      │                                                │  │
│  │  └──────────────────┘                                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

                              DATA FLOW EXAMPLE: Student Login
                              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. User enters credentials → Frontend sends POST /auth/login
2. Backend validates email & password against USER table (BCrypt comparison)
3. JwtUtil generates JWT token (email + role claim, HS256 signature)
4. Backend sends token via HTTPOnly cookie + includes refreshToken in response
5. Frontend stores refreshToken in sessionStorage
6. Browser auto-sends HTTPOnly cookie with each request
7. JwtFilter validates token signature on protected endpoints
8. Service layer queries USER data + CONTENT assigned to role
9. Database returns results → Controller formats to JSON
10. Frontend renders Dashboard with student-specific content

                    SECURITY LAYERS - Authentication Flow
                    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request Journey:
  Browser Request (with HTTPOnly cookie & Authorization header)
         ↓
  CORS Filter (validates origin, allows credentials)
         ↓
  JwtFilter (extracts & validates JWT from cookie/header)
         ↓
  Spring Security (checks role-based @PreAuthorize annotations)
         ↓
  Controller (handles request with authenticated @Principal)
         ↓
  Service Layer (executes business logic with role context)
         ↓
  Repository (executes SQL queries)
         ↓
  MySQL (persists or retrieves data)
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 4.0.3
- **Language**: Java 21
- **Database**: MySQL 8.0.41
- **Security**: Spring Security + JWT
- **Authentication**: HTTPOnly Cookies + JWT Tokens
- **Validation**: Jakarta Bean Validation

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5.4.21
- **HTTP Client**: Axios with interceptors
- **Styling**: CSS3 with CSS variables
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### Backend Setup

```bash
cd ES_Backend

# Configure database in src/main/resources/application.properties
# Update spring.datasource.url, username, password

# Build and run
mvn clean spring-boot:run
```

Server runs on: `http://localhost:8081/api`

### Frontend Setup

```bash
cd ProgressIQ-Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📊 Default Credentials

**Teacher Account:**
- Email: `report.tester.teacher@example.com`
- Password: `Passw0rd!`

**Student Account:**
- Email: `student@example.com`
- Password: `Student@123`

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/teachers` - Get all teachers
- `POST /auth/logout` - Logout user

### Teacher Endpoints
- `GET /teacher/dashboard` - Get dashboard overview
- `GET /teacher/students` - Get assigned students
- `GET /teacher/student-content-progress` - Get detailed student progress
- `GET /teacher/content-completion/{contentId}` - Get content completion stats

### Student Endpoints
- `GET /dashboard/student` - Get student dashboard
- `GET /student/assigned-content` - Get assigned content
- `GET /student/personal-content` - Get personal materials
- `GET /student/progress` - Get personal progress

### Content Management
- `POST /content/add` - Add content
- `POST /content/upload` - Upload file
- `GET /content/teacher` - Get teacher content
- `DELETE /content/{contentId}` - Delete content

### Folders
- `POST /folder/create` - Create folder
- `GET /folder/my` - Get my folders
- `PUT /folder/update/{folderId}` - Update folder
- `DELETE /folder/delete/{folderId}` - Delete folder

### Progress Tracking
- `POST /progress/complete/{contentId}` - Mark as completed
- `POST /progress/toggle/{contentId}` - Toggle completion status

## 🧪 Testing

### Backend Tests
```bash
cd ES_Backend
mvn test
```

### Frontend Tests
```bash
cd ProgressIQ-Frontend
npm run test
```


## 👨‍💻 Author

Developed as a comprehensive education management system demonstrating full-stack Java and React development.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.



---

**Happy Learning! 🎓**
