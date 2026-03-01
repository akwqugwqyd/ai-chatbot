# AI Chatbot

This repository contains a full-stack AI chatbot application. It consists of two main parts:

- **backend/** – A TypeScript-based Express server handling user authentication, conversations, and interactions with the OpenAI API.
- **frontend/** – A React + Vite single-page application utilizing Material UI and React Router for a chat interface.

The project allows users to sign up, log in, and engage in conversations with an AI model (GPT-3.5 Turbo by default). Chats are stored per user, and users can clear their conversation history.

---

## 🔧 Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- A GitHub (or other) account to host the repository
- An OpenAI API key

## 🗂 Project Structure

```
ai-chatbot/
  backend/          # Express/TypeScript API
    src/            # source files
    .env            # local environment variables (ignored)
    package.json
  frontend/         # React + Vite client
    src/            # React components, pages, styles
    public/         # static assets
    package.json
```

Each subfolder has its own `package.json` and can be run independently.

## ⚙️ Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd ai-chatbot
   ```

2. **Backend**:
   ```bash
   cd backend
   cp .env.example .env              # create local env file
   # open .env and fill in values (MONGO_URI, OPENAI_KEY, JWT_SECRET, etc.)
   npm install                       # or yarn
   npm run dev                       # start development server (ts-node)
   ```

3. **Frontend**:
   ```bash
   cd ../frontend
   npm install                       # or yarn
   npm run dev                       # start Vite dev server
   ```

4. Open your browser at `http://localhost:5173` (or the URL Vite prints) and start using the chat interface. Backend runs on port 5000 by default.

## 📁 Environment Variables

Backend expects a `.env` file with the following keys:

```
PORT=5000
MONGO_URI=<your MongoDB connection string>
OPENAI_KEY=<your OpenAI API key>
JWT_SECRET=<random secret for auth tokens>
```

Never commit `.env` to source control. Use `.env.example` for reference.

## 🧠 Features

- User signup / login with JWT-based authentication
- Persistent chat history stored in MongoDB
- Clear conversation functionality
- Simple, responsive chat UI using Material UI
- Server-side integration with OpenAI's GPT models
