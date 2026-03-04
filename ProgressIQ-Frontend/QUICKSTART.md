# Quick Start Guide for ProgressIQ Frontend

## Prerequisites
- Node.js 16+ and npm
- ProgressIQ Backend running on port 8081
- Modern web browser

## Step 1: Installation

```bash
# Navigate to frontend directory
cd ProgressIQ-Frontend

# Install dependencies
npm install
```

## Step 2: Configuration

```bash
# Copy environment example
cp .env.example .env

# Update .env if your backend is on a different URL
# Default: http://localhost:8081/api
```

## Step 3: Start Development Server

```bash
npm run dev
```

Server will be available at `http://localhost:3000`

## Step 4: Test the Application

### Teacher Account
1. Go to http://localhost:3000/register
2. Fill in details with role "Teacher"
3. Login with the provided credentials
4. Access Teacher Dashboard at /teacher-dashboard

### Student Account
1. Go to http://localhost:3000/register
2. Fill in details with role "Student"
3. Login with the provided credentials
4. Access Student Dashboard at /student-dashboard

## Features to Try

### Teacher Dashboard
- 📊 View total students and content statistics
- 📈 Analyze content completion rates
- 👥 Search and filter students by performance
- 📥 Download full analytics report
- 📊 View completion charts and analytics

### Student Dashboard
- 📈 Track overall progress with circular visualization
- 📚 View teacher-assigned content
- ✨ Add personal learning materials
- 📁 Create and organize study folders
- 📊 Download personal progress report

## File Structure Overview

```
src/
├── pages/              # Full page components
│   ├── LoginPage.jsx   # Authentication
│   ├── RegisterPage.jsx
│   ├── TeacherDashboard.jsx  # Teacher UI
│   ├── StudentDashboard.jsx  # Student UI
│   └── LandingPage.jsx       # Home page

├── components/         # Reusable components
│   ├── Layout.jsx      # Sidebar & header
│   ├── Cards.jsx       # Card variations
│   ├── Form.jsx        # Form controls
│   ├── Charts.jsx      # Data visualizations
│   └── ProtectedRoute.jsx

├── services/          # API integration
│   ├── api.js        # Axios setup
│   └── services.js   # API methods

├── context/          # State management
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx

└── styles/           # CSS files (Neumorphism design)
    ├── global.css
    ├── components.css
    └── layout.css
```

## API Endpoints Used

### Auth
- POST /auth/login
- POST /auth/register

### Teacher
- GET /teacher/dashboard
- GET /teacher/students

### Student
- GET /dashboard/student
- GET /student/assigned-content
- GET /student/progress
- POST /progress/complete/{id}
- GET /report/student

### Content & Folders
- POST /content/add
- GET /content/personal
- POST /folder/create
- GET /folder/my

## Theme Customization

The app includes light and dark theme support:
- Click the 🌙/☀️ button in the top right
- Theme preference is saved in localStorage
- Modify colors in `src/styles/global.css` CSS variables

## Troubleshooting

### Backend Connection Error
```
Error: Network Error - Cannot reach backend
→ Make sure backend is running on port 8081
→ Check CORS is enabled in Spring Boot
→ Verify API_BASE_URL in api.js
```

### Login Not Working
```
→ Backend database must have users table created
→ Check MySQL is running and credentials are correct
→ Review backend logs for errors
```

### Charts Not Displaying
```
→ Ensure Chart.js dependencies installed: npm install
→ Check console for JavaScript errors
→ Verify data structure matches chart expectations
```

## Building for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview

# The dist/ folder contains production-ready files
# Deploy dist/ folder to your web server
```

## Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8081/api
```

For production:
```
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Performance Tips

1. **Lazy Load Routes**: Already implemented in app
2. **Optimize Images**: Use WebP format where possible
3. **Code Splitting**: Vite handles this automatically
4. **Caching**: Set appropriate cache headers in production
5. **CDN**: Use CDN for static assets in production

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Dev tools
npm run lint             # Run ESLint (if configured)
```

## Support & Documentation

- See README.md for detailed documentation
- Check backend documentation for API details
- Review component files for usage examples

## Next Steps

1. ✅ Install and run the frontend
2. ✅ Test teacher and student features
3. ✅ Customize colors and theme in styles/
4. ✅ Deploy to your hosting platform
5. ✅ Configure production environment variables

Happy learning! 📚✨
