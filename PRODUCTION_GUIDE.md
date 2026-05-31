# 🚀 Code Review AI - Production Ready Deployment Guide

## Overview

Code Review AI is a professional, production-ready AI-powered code review chatbot built with Express.js, React, and TypeScript. It provides intelligent code analysis, security audits, performance recommendations, and best practices suggestions.

## 🌟 Features

- **Multi-language Code Review**: Supports 20+ programming languages
- **Security Analysis**: Identifies vulnerabilities and security issues
- **Performance Optimization**: Suggests improvements for better performance
- **Code Quality Metrics**: Tracks review history and improvement metrics
- **Rate Limiting**: Built-in request throttling for API protection
- **Professional UI**: Dark-themed, responsive Material-UI interface
- **JWT Authentication**: Secure user authentication with token-based sessions
- **Comprehensive Error Handling**: Detailed error messages and logging

## 📋 Prerequisites

- Node.js 16+ and npm 8+
- MongoDB 4.4+
- OpenAI API Key (for AI code reviews)

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          Frontend (React + Vite)        │
│      - Material-UI Components           │
│      - Syntax Highlighting              │
│      - Real-time Code Display           │
└──────────────┬──────────────────────────┘
               │
               │ HTTP/REST
               ▼
┌─────────────────────────────────────────┐
│     Backend (Express.js + TypeScript)   │
│      - JWT Authentication               │
│      - Rate Limiting                    │
│      - Input Validation                 │
│      - Error Handling                   │
│      - Code Review Logic                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  MongoDB - User & Review Data Storage   │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   OpenAI API - AI Code Reviews          │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start (Development)

### 1. Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd ai-chatbot

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env)**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configurations
```

**Frontend (.env)**
```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env with API URL
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run start
```

Visit `http://localhost:5173` to access the application.

## 📦 Production Deployment

### Prerequisites for Production

1. **Database**: Set up MongoDB Atlas or self-hosted MongoDB
2. **API Keys**: Obtain OpenAI API key
3. **Domain**: Register a domain name
4. **SSL Certificate**: Get an SSL certificate (required for HTTPS)
5. **Hosting**: Cloud provider (AWS, Heroku, DigitalOcean, Vercel, etc.)

### Environment Variables (Production)

#### Backend
```env
# Database
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/code-review-db

# JWT Security (Generate strong random strings!)
JWT_SECRET=<generate-random-string-32-chars-min>
COOKIE_SECRET=<generate-random-string-32-chars-min>

# API Configuration
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# External APIs
OPENAI_API_KEY=<your-openai-api-key>

# Cookie Configuration
COOKIE_DOMAIN=.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

#### Frontend
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_ENV=production
VITE_ENABLE_ANALYTICS=true
```

### Build & Deploy

#### Backend Build
```bash
cd backend
npm run build
npm start
```

#### Frontend Build
```bash
cd frontend
npm run build
# Output: frontend/dist/
```

### Deployment Options

#### 1. **Heroku** (Easiest)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create apps
heroku create code-review-api
heroku create code-review-web

# Add MongoDB Atlas
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set -a code-review-api \
  JWT_SECRET=your_secret \
  COOKIE_SECRET=your_cookie_secret \
  OPENAI_API_KEY=your_key

# Deploy backend
cd backend
git push heroku main

# Deploy frontend (use vercel for better static hosting)
```

#### 2. **AWS EC2 + RDS**

```bash
# Launch EC2 instance (Ubuntu 20.04)
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo and setup
git clone <repo>
cd ai-chatbot/backend
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name "code-review-api"
pm2 save

# Setup Nginx reverse proxy
# Configure SSL with Let's Encrypt
sudo certbot certonly --standalone -d api.yourdomain.com
```

#### 3. **Vercel + Backend Service**

```bash
# Deploy frontend to Vercel
npm install -g vercel
cd frontend
vercel

# Deploy backend to DigitalOcean App Platform or Railway
# Connect to GitHub and auto-deploy
```

#### 4. **Docker Deployment**

Create `Dockerfile` for backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URL: mongodb://admin:password@mongodb:27017/code-review
      JWT_SECRET: your-secret
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://backend:5000/api/v1
```

## 🔒 Security Best Practices

### 1. **Environment Variables**
- Never commit `.env` files
- Use strong random strings for secrets (min 32 characters)
- Rotate secrets regularly

### 2. **Database Security**
- Enable MongoDB Atlas IP Whitelist
- Use strong database credentials
- Enable database encryption at rest
- Regular backups

### 3. **API Security**
- Rate limiting enabled (50 requests per 15 minutes)
- Input validation on all endpoints
- CORS configured for production domain only
- HTTPS enforced
- Secure cookies (httpOnly, secure, sameSite)

### 4. **Code Security**
- Keep dependencies updated: `npm audit`
- Use environment-based configuration
- Enable HTTPS only
- Implement proper error logging without sensitive data

### 5. **Authentication**
- JWT tokens with expiration (7 days)
- Secure cookie storage
- CORS protection
- Session timeout

## 📊 Monitoring & Logging

### Health Check Endpoint
```bash
GET /health
```

### Error Tracking (Optional)
```env
# Add to backend/.env
SENTRY_DSN=https://your-sentry-dsn
```

### Logging
The application logs all:
- API requests (Morgan middleware)
- Errors (with stack traces in development only)
- Authentication attempts
- Rate limit violations

View logs:
```bash
# PM2 logs
pm2 logs code-review-api

# Docker logs
docker logs container-name
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Performance Optimization

1. **Code Splitting**: Frontend uses Vite for automatic code splitting
2. **Caching**: Implement Redis for session caching (optional)
3. **CDN**: Serve static assets through CDN
4. **Database Indexes**: Already configured in MongoDB schema
5. **Compression**: Gzip compression enabled in Express

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check connection string
# Verify IP whitelist in MongoDB Atlas
# Test connection: mongosh "your-connection-string"
```

### Rate Limiting
Adjust in `backend/src/middleware/rate-limiter.ts`:
```typescript
maxRequests: 50,        // requests per window
windowMs: 15 * 60 * 1000, // 15 minutes
```

### API Key Issues
- Verify OpenAI API key is valid
- Check account balance
- Review API quota usage

## 📝 API Documentation

### Code Review Endpoint
```
POST /api/v1/chat/review
Authorization: Bearer <token>

Request:
{
  "code": "your code here",
  "language": "javascript",
  "fileName": "app.js",
  "message": "Please review this code"
}

Response:
{
  "success": true,
  "message": "Code review completed successfully",
  "chats": [...],
  "reviewsCount": 5
}
```

### Get Stats
```
GET /api/v1/chat/stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "stats": {
    "totalReviews": 10,
    "criticalIssues": 2,
    "averageIssuesPerReview": 3,
    "languagesReviewed": ["javascript", "python"]
  }
}
```

## 📱 Supported Languages

JavaScript, TypeScript, Python, Java, C++, C#, Go, Rust, PHP, Swift, Kotlin, SQL, HTML, CSS, SCSS, JSON, XML, YAML, Bash, and more.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

For issues and questions:
1. Check existing issues on GitHub
2. Create detailed bug reports
3. Include environment and error logs

## 🔄 Update & Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit fix

# Commit updates
git add package*.json
git commit -m "chore: update dependencies"
```

### Database Maintenance
```bash
# Backup MongoDB
mongodump --uri="your-connection-string" --out=./backup

# Create indexes
db.users.createIndex({ email: 1 })
db.users.createIndex({ createdAt: -1 })
```

## 🎯 Next Steps

1. Deploy to production
2. Set up monitoring and alerts
3. Configure backup strategy
4. Plan scaling approach
5. Regular security audits

---

**Last Updated**: 2026-05-19
**Version**: 1.0.0
