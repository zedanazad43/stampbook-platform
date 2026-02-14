const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "data.json");
const SYNC_TOKEN = process.env.SYNC_TOKEN || "";

// Import AI Agent Expert
const aiAgentPath = path.join(__dirname, "src/ai-agent-expert/index.js");
if (fs.existsSync(aiAgentPath)) {
  // Dynamically import the AI Agent Expert to avoid issues if it doesn't exist
  const aiAgent = require(aiAgentPath);
  // Mount AI Agent Expert routes
  app.use("/agent", aiAgent);
  console.log("AI Agent Expert mounted successfully");
} else {
  console.warn("AI Agent Expert not found at:", aiAgentPath);
}

// Original Stampcoin Platform routes
async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading data file:", e.message);
    return [];
  }
}

async function writeData(todos) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Write error:", e);
    return false;
  }
}

function requireToken(req, res, next) {
  const auth = req.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  // Allow unauthenticated access in development when SYNC_TOKEN is not set
  // In production, always set SYNC_TOKEN environment variable
  if (!SYNC_TOKEN) {
    console.warn("SYNC_TOKEN not configured - authentication disabled (development mode)");
    return next();
  }
  if (token !== SYNC_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/sync", requireToken, async (req, res) => {
  const todos = await readData();
  res.json({ todos });
});

app.post("/sync", requireToken, async (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.todos)) {
    return res.status(400).json({ error: "Invalid payload, expected { todos: [...] }" });
  }
  const ok = await writeData(payload.todos);
  if (!ok) return res.status(500).json({ error: "Failed to store data" });
  res.json({ ok: true });
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
    version: "2.0.0"
  });
});

const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Stampcoin Platform server listening on port ${port}`);
  console.log(`AI Agent Expert available at: http://localhost:${port}/agent`);
});
