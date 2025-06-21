require('dotenv').config();

const express = require('express');
const session = require('express-session');
const connectDB = require('./config/db');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const socketManager = require('./utils/socketManager');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

// Initialize socket manager
socketManager.setSocketIO(io);

// 🔌 Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    socketManager.addUser(userId, socket.id);
  });

  socket.on('disconnect', () => {
    socketManager.removeUser(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'referralSecret',
  resave: false,
  saveUninitialized: true
}));

// EJS Views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Token-based auth middleware for frontend routes
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, 'baburao ka secret he ese nhi decrypt hoga');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.redirect('/login');
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.redirect('/login');
  }
};

// Backend API routes
const authRoute = require('./routes/authRoutes');
app.use('/api/auth', authRoute);

const purchaseRoutes = require('./routes/purchaseRoutes');
app.use('/api/purchase', purchaseRoutes);

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/report', reportRoutes);

// Frontend routes
app.get('/', (req, res) => res.redirect('/dashboard'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/login', (req, res) => res.render('login'));
app.get('/purchase', (req, res) => res.render('purchase'));

app.get('/dashboard', async (req, res) => {
  try {
    res.render('dashboard', {
      user: { name: '', referralCode: '' },
      earnings: { total: 0, level1Earnings: 0, level2Earnings: 0 },
      referrals: []
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.redirect('/login');
  }
});

// Add a new endpoint to get dashboard data via API
app.get('/api/dashboard', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'baburao ka secret he ese nhi decrypt hoga');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    const PORT = process.env.PORT || 8080;
    const [earningsResponse, referralsResponse] = await Promise.all([
      axios.get(`http://localhost:${PORT}/api/report/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      }),

      axios.get(`http://localhost:${PORT}/api/report/referrals?page=1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ]);

    res.json({
      user: {
        name: user.name,
        referralCode: user.referralCode
      },
      earnings: earningsResponse.data,
      referrals: referralsResponse.data.referrals || []
    });

  } catch (err) {
    console.error('Dashboard API error:', err);
    res.status(401).json({ msg: 'Invalid token' });
  }
});

// Start server
const PORT = process.env.PORT || 8080;
http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = { app, server: http };
