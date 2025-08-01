// server.js (Complete Backend Code with MongoDB, Admin Protection, Static + HTML Serving)

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');

// Models
const User = require('./models/user');
const Feedback = require('./models/Feedback');
const Scholarship = require('./models/scholarship');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/scholarship_finder', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Static files (CSS, images, etc.)

// Session config
app.use(session({
  secret: 'secretKey123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/scholarship_finder' })
}));

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    if (user.role === 'admin') {
      return res.redirect('/admin_dashboard');
    } else {
      return res.redirect('/');
    }
  }
  res.send('Login failed');
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword, role: 'user' });
  res.redirect('/login');
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'search.html'));
});

app.get('/tracker', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'tracker.html'));
});

app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'feedback.html'));
});

app.post('/feedback', async (req, res) => {
  const { name, email, message } = req.body;
  await Feedback.create({ name, email, message });
  res.send('Feedback received. Thank you!');
});

// Admin Routes (Protected)
app.get('/admin_dashboard', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
});

app.get('/admin_add_scholarship', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin_add_scholarship.html'));
});

app.post('/admin_add_scholarship', isAdmin, async (req, res) => {
  const { title, description, eligibility } = req.body;
  await Scholarship.create({ title, description, eligibility });
  res.send('Scholarship added.');
});

app.get('/admin_feedback', isAdmin, async (req, res) => {
  const feedbacks = await Feedback.find();
  res.json(feedbacks);
});

app.get('/admin_manage_users', isAdmin, async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\u{1F4DA} Scholarship Finder running at http://localhost:${PORT}`);
});
