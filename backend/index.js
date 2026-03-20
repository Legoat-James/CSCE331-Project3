import express from "express"
import cors from "cors"
import "dotenv/config"



const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['https://csce-331-project3-frontend.vercel.app',
          'http://localhost:3000'  // for local dev
          ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express backend!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
