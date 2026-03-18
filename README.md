# Full-Stack Application

A full-stack web application built with:
- **Frontend**: React + Vite + Tailwind CSS
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
- Frontend dev server on `http://localhost:5173`
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
2. Open `http://localhost:5173` in your browser
3. To test the backend connection:
   - Visit `http://localhost:5000/api` directly
   - Or use the Example component (see below)

### Using the Example Component

To see Tailwind CSS and backend connection in action, edit `frontend/src/main.jsx`:

```jsx
import Example from './Example.jsx'  // Instead of App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Example />  {/* Instead of <App /> */}
  </StrictMode>,
)
```

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

- `GET /api` - Returns a welcome message
- `GET /api/health` - Health check endpoint

## Adding New Features

### Frontend
- Components go in `frontend/src/`
- Tailwind CSS classes work out of the box
- Import and use in your React components

### Backend
- Add routes in `backend/server.js` or create separate route files
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
- Ensure `@import "tailwindcss";` is in `frontend/src/index.css`
- Restart dev server

## Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [Vercel Deployment](https://vercel.com/docs)
