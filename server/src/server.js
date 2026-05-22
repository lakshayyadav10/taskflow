import dns from 'dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);

import 'dotenv/config';
import { connectDB } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT || 8080;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅  Server running → http://localhost:${PORT}`);
    console.log(`📋  API docs      → http://localhost:${PORT}/api-docs`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',                          // local dev
    'sweet-joy-production-4231.up.railway.app'        // your Railway frontend URL
  ],
  credentials: true
}));