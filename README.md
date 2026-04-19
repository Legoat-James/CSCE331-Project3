# Full-Stack Application

A full-stack web application built with:
- **Frontend**: React + Vite
- **Backend**: Node.js + Express.js
- **Deployment**: Vercel

## Project Structure

```
project3/
├── frontend/          # React frontend with Vite & Tailwind
├── backend/           # Express.js API server
├── package.json       # Root package.json with workspace scripts
└── README.md
```

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

From the root directory:

```bash
npm install
```

This will install dependencies for both frontend and backend thanks to npm workspaces.

## Running the Project

### Option 1: Run Both Together (Recommended for Development)

```bash
npm run dev
```

This starts:
- Frontend dev server on `http://localhost:3000`
- Backend API server on `http://localhost:5000`

### Option 2: Run Separately

**Frontend only:**
```bash
npm run dev:frontend
```

**Backend only:**
```bash
npm run dev:backend
```

**Or manually:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Testing the Connection

1. Start both servers with `npm run dev`
2. Open `http://localhost:3000` in your browser
3. To test the backend connection:
   - Visit `http://localhost:5000/api/test` directly
   - Or use the Example component (see below)

## Building for Production

```bash
npm run build
```

This builds the frontend into `frontend/dist/`.

## Environment Variables

Backend uses a `.env` file (already created):
```
PORT=5000
NODE_ENV=development
```

## API Endpoints

- `GET /api/test` - Simple API test endpoint
- `GET /api/get-full-menu` - Get active menu items
- `GET /api/get-manager-menu` - Get manager menu view
- `GET /api/get-employees` - Get active employees

## Adding New Features

### Frontend
- Components go in `frontend/src/`
- Tailwind CSS classes work out of the box
- Import and use in your React components

### Backend
- Add routes in `backend/index.js` or create separate route files
- Use Express middleware as needed

## Deploying to Vercel

### Frontend Deployment:
1. Push your code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Deploy

### Backend Deployment (Serverless Functions):
1. Create `backend/api/` folder for serverless functions
2. Each file becomes an endpoint
3. Or deploy backend separately (Railway, Render, etc.)

## Troubleshooting

**Port already in use:**
- Change PORT in `backend/.env`
- Or kill the process using that port

**CORS errors:**
- Backend already has CORS enabled
- Verify backend is running on correct port

**Tailwind not working:**
- This project currently uses component CSS files and Bootstrap.
- Restart dev server after dependency or config changes.

**Frontend not appearing when running `npm run dev`:**
- Use the root `npm run dev` script (now uses `concurrently` for reliable parallel startup).
- Confirm frontend URL is `http://localhost:3000` (not `5173`).

## Chatbot Setup

### 1. Get your API Keys
- Go to chat.tamu.ai
- Click on your profile in the bottom left > Settings > Account > API Keys > Generate API Key

### 2. .env Setup
- Add the following to the .env <br>
   TAMUS_AI_CHAT_API_ENDPOINT=https://chat-api.tamu.ai<br>
   TAMUS_AI_CHAT_API_KEY=YOUR_API_KEY_HERE<br>

### 3. Authorize
- Use your API key with the Swagger docs <br>
- Open up the <a href="https://docs.tamus.ai/prod/api_docs.html"> TAMUS AI Framework documentation Swagger page</a> <br>
- Choose your member institution's API URL (https://chat-api.tamu.ai) from the Servers menu in the top left corner. <br>
- Click the green Authorize button in the top right corner. <br>
- Paste your API key into the Value field and click the Authorize button <br> 



## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [Vercel Deployment](https://vercel.com/docs)
