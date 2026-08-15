import express from 'express';
import cors from 'cors';
import { getAnalyticsSeries, getLocations, getRegions } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/api/locations', (req, res) => {
  const year = Number(req.query.year || 2024);
  res.json(getLocations(year));
});

app.get('/api/analytics/regions', (req, res) => {
  res.json(getRegions());
});

app.get('/api/analytics', (req, res) => {
  const region = typeof req.query.region === 'string' ? req.query.region : 'All India';
  res.json(getAnalyticsSeries(region));
});

app.post('/api/chatbot', (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const reply = generateReply(message);
  res.json({ reply });
});

function generateReply(input) {
  const text = input.toLowerCase();

  if (text.includes('climate')) {
    return 'Climate change is a global issue that affects weather, ecosystems, and human health. I can help you explore climate impact data.';
  }

  if (text.includes('map')) {
    return 'The map page can help visualize environmental and climate-related data across regions.';
  }

  if (text.includes('report')) {
    return 'Reports summarize key insights and trends for analysis. I can help you prepare one.';
  }

  return `You said: "${input}". I can help you explore climate insights, maps, and reports.`;
}

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
