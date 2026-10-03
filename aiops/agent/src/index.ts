import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT_AIOPS_AGENT || 8090;

app.post('/webhook/alerts', (req, res) => {
  console.log('[AIOps] Alert received:', JSON.stringify(req.body, null, 2));
  // Ingest alert -> trigger investigation loop
  res.status(202).json({ status: 'Investigating', timestamp: new Date().toISOString() });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP', mode: 'Controlled Autonomous' });
});

app.listen(PORT, () => {
  console.log(`[AIOps Agent] Running on port ${PORT}`);
});
