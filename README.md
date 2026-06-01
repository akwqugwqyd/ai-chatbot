# 🤖 Code Review AI - Professional Code Analysis Chatbot

A production-ready, AI-powered code review chatbot that provides intelligent analysis, security audits, performance optimization suggestions, and best practices recommendations for your code.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

## 🌟 Key Features

- **🔍 Intelligent Code Analysis**: Automatic detection of bugs, vulnerabilities, and code quality issues
- **🛡️ Security Audits**: Identify security vulnerabilities and potential exploits
- **⚡ Performance Optimization**: Get actionable recommendations for performance improvements
- **📚 Best Practices**: Learn and follow industry-standard coding conventions
- **🔄 Multi-Language Support**: Analyze code in 20+ programming languages (JavaScript, Python, Java, Go, Rust, etc.)
- **📊 Review Tracking**: Track your code review history and improvement metrics with detailed statistics
- **🎨 Professional UI**: Beautiful dark-themed interface with syntax highlighting and responsive design
- **🔐 Secure**: JWT authentication, rate limiting, input validation, CORS protection
- **📈 Scalable**: Production-ready architecture with comprehensive error handling and logging

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB 4.4+
- **Authentication**: JWT + Secure HTTP-only Cookies
- **Validation**: Express Validator
- **Security**: Bcrypt, CORS, Rate Limiting, Input Sanitization
- **API**: OpenAI (AI Code Reviews)
- **Package Manager**: npm 8+

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Emotion CSS-in-JS
- **Code Highlighting**: React Syntax Highlighter
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons
- **Routing**: React Router v7

## 📦 Installation & Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB 4.4+ (local or MongoDB Atlas)
- OpenAI API Key (get at https://platform.openai.com)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd ai-chatbot
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# - MONGODB_URL: Your MongoDB connection string
# - OPENAI_API_KEY: Your OpenAI API key
# - JWT_SECRET: Generate a strong random string
# - COOKIE_SECRET: Generate a strong random string

# Start development server
npm run dev
# Or for production
npm run build && npm start
```

### 3. Frontend Setup (new terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run start
# Or for production
npm run build
```

### 4. Access Application
Open your browser at `http://localhost:5173` and sign up to get started!

## 📖 Usage Guide

### Submitting Code for Review

1. **Authentication**
   - Sign up with email and password
   - Log in with your credentials
   - Your session is secure and lasts 7 days

2. **Submit Code**
   - Paste code directly or upload a file
   - Supported file types: `.js`, `.ts`, `.py`, `.java`, etc.
   - Maximum file size: 100KB

3. **Configure Review**
   - Select programming language (auto-detected)
   - Add optional context or specific questions
   - Language support: 20+ programming languages

4. **Get Detailed Review**
   - Instant AI-powered code analysis
   - Comprehensive feedback with recommendations

### Understanding Review Results

Each review includes:

- **✅ Summary**: Quick overview of findings
- **🚨 Critical Issues**: Major bugs and security vulnerabilities  
- **⚠️ High Priority**: Important issues to address
- **⚡ Medium**: Improvements for performance
- **💡 Low Priority**: Nice-to-have optimizations

### Track Your Progress

View your personal statistics dashboard:
- Total reviews completed
- Critical issues found
- Languages you've reviewed
- Average issues per review
- Review history with timestamps

## 🚀 Production Deployment

For detailed deployment instructions, see [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)

### Quick Deploy Options

#### Heroku
```bash
heroku create your-app-name
heroku config:set JWT_SECRET=<secret> OPENAI_API_KEY=<key>
git push heroku main
```

#### Docker
```bash
docker-compose up -d
# Visit http://localhost:3000
```

#### Railway, Vercel, AWS, or DigitalOcean
See [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md) for platform-specific instructions.

## 🔒 Security Features

- ✅ **JWT Authentication**: 7-day token expiry
- ✅ **Secure Cookies**: HTTP-only, secure, sameSite
- ✅ **Rate Limiting**: 50 requests per 15 minutes
- ✅ **Input Validation**: All inputs validated and sanitized
- ✅ **CORS Protection**: Configured for production domain
- ✅ **Password Hashing**: Bcrypt with salt rounds
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **XSS Protection**: React's built-in escaping
- ✅ **HTTPS Support**: Production-ready SSL/TLS

## 📚 API Endpoints

### Authentication
```
POST   /api/v1/user/signup      - Register new user
POST   /api/v1/user/login       - Login user
GET    /api/v1/user/auth-status - Verify authentication
GET    /api/v1/user/logout      - Logout user
```

### Code Reviews
```
POST   /api/v1/chat/review      - Submit code for review
GET    /api/v1/chat/all-chats   - Get all reviews
GET    /api/v1/chat/stats       - Get user statistics
DELETE /api/v1/chat/delete      - Delete all reviews
```

### Health
```
GET    /health                  - Health check
```

### Full API Documentation
See API requests in [frontend/src/helpers/api-communicator.ts](frontend/src/helpers/api-communicator.ts)

## 🌍 Supported Languages

- **Web**: JavaScript, TypeScript, JSX, TSX, HTML, CSS, SCSS
- **Backend**: Python, Java, Go, Rust, PHP, C, C++, C#
- **Data**: SQL, JSON, XML, YAML
- **Mobile**: Swift, Kotlin
- **Scripting**: Bash

Plus 5+ more languages with auto-detection.

## 📊 Project Structure

```
ai-chatbot/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── chat-controller.ts
│   │   │   ├── code-review-controller.ts (NEW)
│   │   │   └── user-controller.ts
│   │   ├── models/
│   │   │   └── User.ts (Enhanced for code reviews)
│   │   ├── routes/
│   │   │   ├── chat-routes.ts
│   │   │   └── user-routes.ts
│   │   ├── middleware/
│   │   │   └── rate-limiter.ts (NEW)
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── token-manager.ts
│   │   │   └── validators.ts
│   │   ├── config/
│   │   │   └── openai-config.ts
│   │   ├── db/
│   │   │   └── connection.ts
│   │   ├── app.ts
│   │   └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatItem.tsx
│   │   │   │   └── CodeReviewItem.tsx (NEW)
│   │   │   ├── footer/
│   │   │   ├── header/
│   │   │   └── shared/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── Chat.tsx (Enhanced)
│   │   │   ├── Home.tsx (Updated)
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── Notfound.tsx
│   │   ├── helpers/
│   │   │   └── api-communicator.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── README.md
│
├── PRODUCTION_GUIDE.md (NEW - Comprehensive deployment guide)
├── README.md (This file)
└── vercel.json
```

## 🎓 Example Code Review

**Input:**
```javascript
function getUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .catch(err => console.log(err));
}
```

**Review Output:**
```
✅ POSITIVE ASPECTS:
- Clean function name
- Handles API call

🚨 CRITICAL ISSUES:
1. No error handling - promise rejection is swallowed
2. No validation of userId parameter
3. API endpoint vulnerable to injection attacks

⚠️ HIGH PRIORITY:
- Missing return statement in error handler
- No timeout handling for hanging requests

⚡ RECOMMENDATIONS:
async function getUserData(userId) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId');
  }
  
  try {
    const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error; // Re-throw for caller to handle
  }
}
```

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```env
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/code-review-db

# JWT & Security
JWT_SECRET=<32+ character random string>
COOKIE_SECRET=<32+ character random string>
TOKEN_EXPIRY=7d

# API
OPENAI_API_KEY=sk-proj-<your-key>
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Cookie
COOKIE_DOMAIN=yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_ENV=development
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=false
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

### Linting
```bash
cd backend && npm run lint
cd frontend && npm run lint
```

## 📈 Performance Metrics

- **API Response Time**: 3-5 seconds (typical code review)
- **Rate Limit**: 50 requests per 15 minutes per user
- **Max Code Size**: 50KB per submission
- **Frontend Bundle**: ~300KB gzipped
- **Database Indexes**: Optimized for fast queries
- **Caching**: Smart in-memory caching for frequent operations

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check connection string format
# Verify IP whitelist in MongoDB Atlas
# Test with: mongosh "connection-string"
```

### Rate Limit Errors
```bash
# Limit is 50 requests per 15 minutes
# Wait for window to reset
# Adjust in: backend/src/middleware/rate-limiter.ts
```

### API Key Invalid
```bash
# Verify OpenRouter API key
# Check account balance
# Review quota usage in OpenRouter dashboard
```

### Port Already in Use
```bash
# Change port in .env: PORT=5001
# Or kill process: lsof -ti:5000 | xargs kill -9
```

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🐛 Reporting Issues

Please create a GitHub issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Error messages/screenshots
- Environment (OS, Node version, etc.)

## 💬 Support

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: [PRODUCTION_GUIDE.md](./PRODUCTION_GUIDE.md)
- **Email**: support@codereviewer.ai

## 🗺️ Roadmap

- [ ] Batch code review submissions
- [ ] Team collaboration features
- [ ] Custom review templates
- [ ] GitHub/GitLab integration
- [ ] Advanced analytics dashboard
- [ ] Scheduled reviews
- [ ] Slack/Discord notifications
- [ ] VS Code extension
- [ ] Browser extensions

## 📊 Stats

| Metric | Value |
|--------|-------|
| Supported Languages | 20+ |
| Average Review Time | 3-5 seconds |
| Max Code Size | 50KB |
| Review Limit | 5 reviews/user/day |
| API Rate Limit | 50 req/15min |
| Auth Token Expiry | 7 days |
| Database | MongoDB 4.4+ |

## GitHub PR Review Setup

For Vercel deployment, configure these environment variables:

```env
MONGODB_URL=your-mongodb-atlas-url
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4o-mini
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
DAILY_REVIEW_LIMIT=5
GITHUB_TOKEN=your-github-token
GITHUB_WEBHOOK_SECRET=your-webhook-secret
GITHUB_WEBHOOK_PROCESS_MODE=async
MAX_PR_DIFF_CHARS=50000
FRONTEND_URL=https://your-app.vercel.app
```

Leave `COOKIE_DOMAIN` unset on Vercel unless you intentionally use multiple subdomains. If you set it, use a bare domain such as `example.com`, not `https://example.com`.

Use this GitHub webhook payload URL:

```text
https://your-app.vercel.app/_/backend/api/v1/github/webhook
```

Webhook settings:
- Content type: `application/json`
- Secret: same value as `GITHUB_WEBHOOK_SECRET`
- Events: Pull requests

The app also supports manual PR review from the review workspace by pasting a GitHub pull request URL.

## 🙏 Acknowledgments

- OpenRouter for AI model integration
- Material-UI for beautiful components
- Express.js community for solid framework
- React community for amazing ecosystem
- MongoDB for reliable database
- All contributors and supporters

---

**Last Updated**: May 19, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**License**: MIT

Made with ❤️ for developers who care about code quality

