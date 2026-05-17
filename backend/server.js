require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/results',   require('./routes/results'));
app.get('/api/health', (_, res) => res.json({ status: 'ok', service: 'IntriVue v2' }));

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ MONGO_URI missing");
  process.exit(1);
}
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend → http://localhost:${PORT}`));

// Keep AI service awake — ping it every 10 minutes
// Add this AFTER mongoose.connect() in server.js
if (process.env.NODE_ENV === 'production' && process.env.AI_SERVICE_URL) {
  setInterval(async () => {
    try {
      const fetch = require('node-fetch')
      await fetch(`${process.env.AI_SERVICE_URL}/health`, { timeout: 5000 })
      console.log('AI service pinged')
    } catch (e) {
      console.warn('AI service ping failed:', e.message)
    }
  }, 10 * 60 * 1000) // every 10 minutes
}
