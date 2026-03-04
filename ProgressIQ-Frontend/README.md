# ProgressIQ Frontend

A modern, production-ready React frontend for the ProgressIQ learning analytics platform with Neumorphism design, built with Vite.

## Features

- 🎨 **Neumorphism Design** - Soft, modern UI with beautiful shadows and transitions
- 🌓 **Light/Dark Theme** - Toggle between themes with localStorage persistence
- 📈 **Analytics Dashboard** - Real-time charts and visualizations using Chart.js
- 👥 **Role-Based Access** - Separate dashboards for teachers and students
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - JWT-based auth with localStorage storage
- 🎯 **Progress Tracking** - Circular and linear progress visualizations
- 📊 **Report Generation** - Download progress reports as JSON files

## Project Structure

```
ProgressIQ-Frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.jsx       # Sidebar, Header, Navigation
│   │   ├── Cards.jsx        # Card components
│   │   ├── Form.jsx         # Input, Button, Textarea, etc.
│   │   ├── Charts.jsx       # Chart visualizations
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── pages/               # Page components
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── TeacherDashboard.jsx
│   │   └── StudentDashboard.jsx
│   ├── services/            # API services
│   │   ├── api.js           # Axios configuration
│   │   └── services.js      # API endpoints
│   ├── context/             # React Context
│   │   ├── AuthContext.jsx  # Authentication state
│   │   └── ThemeContext.jsx # Theme state
│   ├── styles/              # CSS files
│   │   ├── global.css       # Global styles
│   │   ├── components.css   # Component styles
│   │   └── layout.css       # Layout styles
│   ├── utils/               # Utility functions
│   │   └── helpers.js       # Helper functions
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

## Installation

1. **Clone the project and navigate to frontend directory:**
```bash
cd ProgressIQ-Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API base URL:**
   - Edit `src/services/api.js` and update `API_BASE_URL` if needed
   - Default: `http://localhost:8081/api`

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## API Integration

The frontend automatically connects to your Spring Boot backend endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Teacher Endpoints
- `GET /teacher/dashboard` - Get teacher dashboard data
- `GET /teacher/students` - Get list of students
- `GET /teacher/content-completion/{contentId}` - Get content completion stats

### Student Endpoints
- `GET /dashboard/student` - Get student dashboard data
- `GET /student/assigned-content` - Get assigned content
- `GET /student/progress` - Get student progress
- `GET /student/personal-content` - Get personal content
- `POST /progress/complete/{contentId}` - Mark content as completed
- `GET /report/student` - Generate student report

### Content Management
- `POST /content/add` - Add new content
- `GET /content/teacher` - Get teacher's content
- `GET /content/personal` - Get personal content

### Folder Management
- `POST /folder/create` - Create folder
- `GET /folder/my` - Get user's folders

## Styling

### Color Palette
- Primary: `#667eea`
- Secondary: `#764ba2`
- Success: `#48bb78`
- Warning: `#f6ad55`
- Danger: `#f56565`

### Design System
- **Shadows**: Neumorphic soft shadows for depth
- **Radius**: 8px to 20px border radius
- **Spacing**: Consistent spacing scale
- **Transitions**: Smooth 150ms to 350ms transitions
- **Typography**: System fonts with optimal sizing

## Customization

### Change Color Scheme
Edit CSS variables in `src/styles/global.css`:
```css
:root {
  --color-primary: #667eea;
  --color-secondary: #764ba2;
  /* ... more colors ... */
}
```

### Modify Layout
- Sidebar width: Edit `src/styles/layout.css`
- Main padding: Adjust `layout-main` padding
- Header height: Modify `layout-header` padding

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- ✅ Code splitting with Vite
- ✅ Lazy loading of routes
- ✅ Optimized bundle size
- ✅ CSS-in-JS for dynamic styles
- ✅ Debounced API calls

## Security

- 🔒 JWT token stored in localStorage
- 🔐 Protected routes with role-based access
- 🛡️ Automatic token refresh on 401
- 🚫 CORS-aware API calls

## Dependencies

- **React 18.x** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Chart.js & react-chartjs-2** - Data visualization
- **Vite** - Build tool

## Environment Variables

Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://localhost:8081/api
```

## Troubleshooting

### API Connection Issues
- Ensure backend is running on port 8081
- Check CORS configuration in Spring Boot
- Verify API base URL in `src/services/api.js`

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear cache and reload

### Charts Not Displaying
- Ensure Chart.js and react-chartjs-2 are installed
- Verify data is being passed correctly to chart components

## License

MIT License - Feel free to use this project for your own purposes.

## Support

For issues or questions about the frontend, please check the main project documentation or create an issue in the repository.
