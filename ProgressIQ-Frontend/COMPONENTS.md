# ProgressIQ Frontend - Component Documentation

## Overview

This document describes all reusable components and their usage.

## Layout Components (`components/Layout.jsx`)

### Header
Main page header with theme toggle and logout button.
```jsx
<Header title="Dashboard" />
```

### Sidebar
Left navigation sidebar.
```jsx
<Sidebar>
  <SidebarHeader />
  <SidebarNav>
    <NavItem icon="📈" label="Overview" active={true} onClick={...} />
  </SidebarNav>
  <SidebarFooter>
    <UserProfile user={user} />
  </SidebarFooter>
</Sidebar>
```

### Layout
Main layout wrapper with sidebar.
```jsx
<Layout sidebar={<Sidebar>...</Sidebar>}>
  <Header title="Page Title" />
  <div className="layout-main">Content</div>
</Layout>
```

## Card Components (`components/Cards.jsx`)

### Card
Basic neumorphic card.
```jsx
<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### StatCard
Statistics card with icon.
```jsx
<StatCard
  title="Total Students"
  value={42}
  icon="👥"
  color="primary"
/>
```

### ProgressCard
Progress visualization card.
```jsx
<ProgressCard
  title="Learning Progress"
  completed={8}
  total={10}
  percentage={80}
/>
```

### ContentCard
Content item card.
```jsx
<ContentCard
  title="Python Basics"
  description="Learn Python fundamentals"
  status="pending"
  onAction={() => {}}
  actionLabel="Start"
/>
```

### ChartCard
Container for charts.
```jsx
<ChartCard title="Analytics">
  <BarChart ... />
</ChartCard>
```

## Form Components (`components/Form.jsx`)

### Button
Neumorphic button with variants.
```jsx
<Button variant="primary" onClick={...}>
  Click Me
</Button>
```

Props:
- `variant`: 'default' | 'primary' | 'secondary'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `block`: full width

### Input
Text input field.
```jsx
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={value}
  onChange={handleChange}
  error={error}
  required
/>
```

### Textarea
Multi-line text input.
```jsx
<Textarea
  label="Description"
  placeholder="Enter description"
  value={value}
  onChange={handleChange}
/>
```

### Select
Dropdown selection.
```jsx
<Select
  label="Role"
  value={role}
  onChange={handleChange}
  options={[
    { value: 'student', label: 'Student' },
    { value: 'teacher', label: 'Teacher' }
  ]}
/>
```

### Alert
Alert/notification message.
```jsx
<Alert 
  type="success"
  message="Operation successful!"
  onClose={() => {}}
/>
```

Types: 'success' | 'danger' | 'warning' | 'info'

### Badge
Small label badge.
```jsx
<Badge variant="success">Completed</Badge>
```

Variants: 'primary' | 'success' | 'warning' | 'danger'

### Modal
Modal dialog.
```jsx
<Modal
  isOpen={true}
  onClose={() => {}}
  title="Edit Profile"
  size="md"
>
  {/* Modal content */}
</Modal>
```

Sizes: 'sm' | 'md' | 'lg'

### Table
Data table component.
```jsx
<Table
  headers={['Name', 'Email', 'Status']}
  rows={[
    ['John', 'john@example.com', 'Active'],
    ['Jane', 'jane@example.com', 'Active']
  ]}
  onRowClick={(row) => {}}
/>
```

## Chart Components (`components/Charts.jsx`)

### BarChart
Bar chart visualization.
```jsx
<BarChart
  labels={['Jan', 'Feb', 'Mar']}
  datasets={[{
    label: 'Sales',
    data: [100, 200, 150]
  }]}
/>
```

### LineChart
Line chart visualization.
```jsx
<LineChart
  labels={['Week 1', 'Week 2', 'Week 3']}
  datasets={[{
    label: 'Progress',
    data: [20, 45, 70]
  }]}
/>
```

### PieChart
Pie/donut chart visualization.
```jsx
<PieChart
  labels={['Completed', 'Pending', 'Failed']}
  data={[30, 40, 30]}
/>
```

### CircularProgress
Circular progress indicator.
```jsx
<CircularProgress
  percentage={75}
  label="Your Progress"
  size={200}
/>
```

## Protected Routes (`components/ProtectedRoute.jsx`)

### PrivateRoute
Requires authentication.
```jsx
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

### RoleRoute
Requires specific role.
```jsx
<RoleRoute requiredRole="TEACHER">
  <TeacherDashboard />
</RoleRoute>
```

## Styling Guide

### CSS Variables
All components use CSS custom properties defined in `styles/global.css`:
```css
--color-primary: #667eea
--color-secondary: #764ba2
--bg-primary: #f5f7fa
--text-primary: #2d3748
--shadow-md: 6px 6px 16px rgba(...)
--radius-lg: 16px
```

### Utility Classes
Pre-built utility classes for common patterns:
```jsx
<div className="flex gap-md">...</div>
<p className="text-muted">Muted text</p>
<button className="btn btn-primary btn-sm">Small Button</button>
```

## Context Hooks (`context/`)

### useAuth
Access authentication state.
```jsx
const { user, token, isAuthenticated, login, logout } = useAuth()
```

### useTheme
Access theme state.
```jsx
const { isDark, toggleTheme } = useTheme()
```

## Service Functions (`services/`)

### authService
```jsx
authService.login(email, password)
authService.register(username, email, password, role)
```

### teacherService
```jsx
teacherService.getDashboard()
teacherService.getStudents()
teacherService.getContentCompletion(contentId)
```

### studentService
```jsx
studentService.getDashboard()
studentService.getAssignedContent()
studentService.getProgress()
studentService.markCompleted(contentId)
studentService.getReport()
```

### contentService
```jsx
contentService.addContent(title, desc, url, folderId, isPersonal)
contentService.getTeacherContent()
contentService.getStudentPersonalContent()
```

### folderService
```jsx
folderService.createFolder(name, description)
folderService.getMyFolders()
```

## Helper Functions (`utils/helpers.js`)

### formatDate
Format date string to readable format.
```jsx
formatDate('2024-01-15')  // "Jan 15, 2024"
```

### calculateProgress
Calculate percentage progress.
```jsx
calculateProgress(8, 10)  // 80
```

### downloadReport
Download data as JSON file.
```jsx
downloadReport(data, 'report.json')
```

### getInitials
Get user initials.
```jsx
getInitials('John Doe')  // "JD"
```

## Examples

### Teacher Dashboard Overview Card
```jsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: 'var(--spacing-lg)'
}}>
  <StatCard
    title="Total Students"
    value={dashboardData.totalStudents}
    icon="👥"
    color="primary"
  />
  <StatCard
    title="Avg Progress"
    value={`${avgProgress}%`}
    icon="📈"
    color="info"
  />
</div>
```

### Form with Validation
```jsx
const [form, setForm] = useState({ email: '', password: '' })
const [errors, setErrors] = useState({})

const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    await authService.login(form.email, form.password)
  } catch (err) {
    setErrors({ submit: err.message })
  }
}

return (
  <form onSubmit={handleSubmit}>
    <Input
      label="Email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      error={errors.email}
    />
    {errors.submit && <Alert type="danger" message={errors.submit} />}
  </form>
)
```

## Best Practices

1. **Always use className** for styling, not inline styles (except for dynamic values)
2. **Wrap containers** with `<div className="container">` for max-width
3. **Use semantic HTML** - buttons, nav, section elements
4. **Responsive design** - test at 320px, 768px, 1024px widths
5. **Accessibility** - include labels, alt text, ARIA attributes
6. **Performance** - memoize complex components
7. **Error handling** - always provide user feedback
8. **Loading states** - show spinners during async operations

## Debugging Tips

1. Check browser console for errors
2. Use React DevTools to inspect component state
3. Check network tab for API errors
4. Verify theme toggle works (check data-theme attribute)
5. Test localStorage by opening DevTools > Application > Local Storage
