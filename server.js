const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');
const http      = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log(' Client connected to WebSocket');
});

// ── MIDDLEWARE ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── DATABASE ─────────────────────────────────────────────
const MONGO_URI = 'mongodb://127.0.0.1:27017/library_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('  MongoDB connected → library_db'))
  .catch(err => {
    console.error('  MongoDB connection failed:', err.message);
    console.error('   Make sure MongoDB is running: sudo systemctl start mongod');
    process.exit(1);
  });

// ── ROUTES ───────────────────────────────────────────────
app.use('/api/authors', require('./routes/authors'));
app.use('/api/genres',  require('./routes/genres'));
app.use('/api/books',   require('./routes/books'));

// Serve the frontend UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── JENKINS WEBHOOK ──────────────────────────────────────
app.post('/api/jenkins-webhook', (req, res) => {
  const payload = req.body;
  console.log(' Received Jenkins webhook');
  
  // Broadcast to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'jenkins', data: payload }));
    }
  });
  
  res.status(200).json({ message: 'Webhook received' });
});

// ── START ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  console.log(`\n  Server running at http://localhost:${PORT}`);
  
  try {
    const ngrok = require('@ngrok/ngrok');
    console.log(`  Starting ngrok tunnel...`);
    const listener = await ngrok.forward({ addr: PORT, authtoken: '3D2sF85vvakVhijwD9QLj9JQK1T_4YSh4jNajbj49xukmq7JU' });
    console.log(`\n  Ngrok tunnel established!`);
    console.log(`  Use THIS URL for your Jenkins webhook: ${listener.url()}/api/jenkins-webhook`);
  } catch (err) {
    console.error('   Failed to start ngrok:', err.message);
  }

  console.log(`\n  API endpoints:`);
  console.log(`   GET    /api/authors`);
  console.log(`   POST   /api/authors`);
  console.log(`   GET    /api/authors/:id   (with their books)`);
  console.log(`   PUT    /api/authors/:id`);
  console.log(`   DELETE /api/authors/:id   (cascades to books)`);
  console.log(`\n   GET    /api/genres`);
  console.log(`   POST   /api/genres`);
  console.log(`   GET    /api/genres/:id    (with tagged books)`);
  console.log(`   DELETE /api/genres/:id   ($pull from all books)`);
  console.log(`\n   GET    /api/books        (populated author + genres)`);
  console.log(`   POST   /api/books`);
  console.log(`   GET    /api/books/:id`);
  console.log(`   PUT    /api/books/:id`);
  console.log(`   DELETE /api/books/:id`);
  console.log(`   GET    /api/books/aggregate/stats  (raw $lookup)`);
});
