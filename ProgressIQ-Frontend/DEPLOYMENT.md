# Deployment Guide for ProgressIQ Frontend

## Prerequisites

- Node.js 16+ and npm
- Git (for version control)
- Hosting platform account (Vercel, Netlify, AWS, etc.)
- Production backend URL

## Pre-Deployment Checklist

### Code Quality
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] All API endpoints verified working
- [ ] Theme toggle tested (light/dark)
- [ ] Responsive design tested on mobile/tablet
- [ ] All forms validated
- [ ] Error handling implemented

### Configuration
- [ ] Environment variables configured
- [ ] API base URL updated for production
- [ ] CORS enabled on backend
- [ ] JWT secret configured on backend

## Build for Production

### Step 1: Prepare Environment
```bash
# Create .env.production file
cat > .env.production << EOF
VITE_API_BASE_URL=https://your-api-domain.com/api
EOF
```

### Step 2: Build Application
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Step 3: Test Production Build Locally
```bash
npm run preview
```

Visit `http://localhost:4173` to verify the build works correctly.

## Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel is optimized for Vite applications and provides automatic deployments.

#### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### Configuration
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_BASE_URL": "@vite_api_base_url"
  }
}
```

#### Environment Variables (Vercel Dashboard)
1. Settings → Environment Variables
2. Add `VITE_API_BASE_URL` with your production API URL
3. Apply to Production, Preview, Development

### Option 2: Netlify

#### Setup
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[env]
  VITE_API_BASE_URL = "https://your-api-domain.com/api"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: AWS S3 + CloudFront

#### Setup
```bash
# Build
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### S3 Bucket Configuration
1. Enable static website hosting
2. Set index.html as index document
3. Block public access (use CloudFront)
4. Enable versioning for rollbacks

### Option 4: Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:
```nginx
server {
  listen 80;
  location / {
    root /usr/share/nginx/html;
    index index.html index.htm;
    try_files $uri $uri/ /index.html;
  }
  
  location /api/ {
    proxy_pass https://your-api-domain.com/api/;
    proxy_set_header Authorization $http_authorization;
  }
}
```

Build and push:
```bash
docker build -t progressiq-frontend:latest .
docker tag progressiq-frontend:latest your-registry/progressiq-frontend:latest
docker push your-registry/progressiq-frontend:latest
```

### Option 5: Traditional Web Server (Apache/Nginx)

#### Nginx Configuration
```nginx
server {
  listen 80;
  server_name your-domain.com;
  
  root /var/www/progressiq-frontend;
  index index.html;
  
  # SPA routing
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # API proxy
  location /api/ {
    proxy_pass https://your-api-domain.com/api/;
    proxy_set_header Authorization $http_authorization;
  }
  
  # Cache busting for assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
    expires 7d;
    add_header Cache-Control "public, immutable";
  }
  
  location ~* \.(html)$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
}
```

#### Apache Configuration
```apache
<VirtualHost *:80>
  ServerName your-domain.com
  DocumentRoot /var/www/progressiq-frontend
  
  <Directory /var/www/progressiq-frontend>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </Directory>
  
  ProxyPreserveHost On
  ProxyPass /api/ https://your-api-domain.com/api/
  ProxyPassReverse /api/ https://your-api-domain.com/api/
</VirtualHost>
```

## Post-Deployment

### Testing
1. **Test Login**: Verify authentication works
2. **Test Dashboard**: Check teacher and student dashboard load data
3. **Test API Calls**: Verify all endpoints work
4. **Test Theme**: Toggle light/dark theme
5. **Test Forms**: Test all form submissions
6. **Test Charts**: Verify charts render correctly
7. **Test Downloads**: Test report downloads
8. **Browser Testing**: Test on Chrome, Firefox, Safari, Edge

### Monitoring
```javascript
// Add error tracking (e.g., Sentry)
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
})
```

### Performance Optimization
1. Enable gzip compression
2. Set cache headers
3. Use CDN for static assets
4. Monitor performance with:
   - Google Lighthouse
   - WebPageTest
   - Sentry Performance

## SSL/HTTPS Setup

### Let's Encrypt (Free)
```bash
# Using Certbot for Nginx
sudo certbot certonly --nginx -d your-domain.com
```

### Enable HSTS Headers
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Continuous Integration/Deployment

### GitHub Actions Example
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.PRODUCTION_API_URL }}
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Rollback Procedure

### If the deployment has issues:
```bash
# Vercel
vercel rollback

# Git-based deployments
git revert <commit-hash>
git push origin main

# Manual
Restore from previous backup or redeploy last known working version
```

## Security Hardening

### Headers to Add
```nginx
# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

# X-Frame-Options
add_header X-Frame-Options "SAMEORIGIN" always;

# X-Content-Type-Options
add_header X-Content-Type-Options "nosniff" always;

# Referrer-Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# CORS (if using API from different domain)
add_header Access-Control-Allow-Origin "https://your-domain.com" always;
```

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### API Not Connecting
- Verify `VITE_API_BASE_URL` is set correctly
- Check backend CORS configuration
- Verify backend is running and accessible
- Check browser console for errors

### Theme Not Persisting
- Clear browser cache
- Check localStorage in DevTools
- Verify ThemeContext is initialized

### Routes Not Working (404 on Refresh)
- Configure server to redirect all routes to index.html
- For Nginx/Apache, use try_files or mod_rewrite
- For Vercel/Netlify, configuration is automatic

## Monitoring & Analytics

### Add Google Analytics
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Add Sentry for Error Tracking
```bash
npm install @sentry/react
```

## Maintenance

### Weekly Tasks
- Monitor error logs
- Check website uptime
- Verify API connectivity

### Monthly Tasks
- Update dependencies: `npm update`
- Review and optimize performance
- Security audit of configuration

### Quarterly Tasks
- Full security assessment
- Backup review
- Capacity planning

## Support

For deployment issues:
1. Check documentation for your hosting platform
2. Review application logs and error messages
3. Verify all environment variables are set
4. Test locally with production configuration
5. Check backend API availability

---

**Deployment Completed!** 🎉

Your ProgressIQ frontend is now live and ready for users!
