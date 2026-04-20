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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend → http://localhost:${PORT}`));
