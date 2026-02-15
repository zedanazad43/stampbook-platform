const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import AI Agent Expert
const aiAgentPath = path.join(__dirname, "src/ai-agent-expert/index.js");
if (fs.existsSync(aiAgentPath)) {
  // Dynamically import the AI Agent Expert to avoid issues if it doesn't exist
  const aiAgent = require(aiAgentPath);

  // Mount AI Agent Expert routes directly
  app.use("/agent", aiAgent);
  console.log("AI Agent Expert mounted successfully");
} else {
  console.warn("AI Agent Expert not found at:", aiAgentPath);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stampcoin-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Stampcoin Platform API',
    version: '1.0.0',
    documentation: 'https://github.com/zedanazad43/stp'
  });
});

// AI Agent Expert integration endpoint
app.get("/ai-agent-status", async (req, res) => {
  try {
    const agentStatus = await fetch(`${process.env.BASE_URL || "http://localhost:" + process.env.PORT}/agent/status`);
    const statusData = await agentStatus.json();
    res.json({
      agentIntegrated: true,
      status: statusData
    });
  } catch (error) {
    res.json({
      agentIntegrated: false,
      error: "AI Agent Expert not available",
      message: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Stampcoin Platform",
    version: "1.0.0"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Stampcoin Platform server listening on port ${PORT}`);
  console.log(`AI Agent Expert available at: http://localhost:${PORT}/agent`);
});
