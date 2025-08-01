// scholarship-backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://Suhruth21:<Suhruth@21>@cluster0.nngtsg1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static frontend files

// Models
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'student' },
  category: String,
  income: Number,
  state: String,
  gender: String
});

const scholarshipSchema = new mongoose.Schema({
  title: String,
  eligibility: String,
  amount: String,
  lastDate: String,
  provider: String,
  link: String,
  category: String
});

const feedbackSchema = new mongoose.Schema({
  email: String,
  subject: String,
  message: String
});

const trackerSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  scholarshipId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'Pending' }
});

const User = mongoose.model('User', userSchema);
const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Tracker = mongoose.model('Tracker', trackerSchema);

// Routes

// Register
app.post('/register', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.send({ message: 'User registered successfully' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).send({ message: 'Invalid credentials' });
  res.send(user);
});

// Get all scholarships
app.get('/api/scholarships', async (req, res) => {
  const data = await Scholarship.find();
  res.json(data);
});

// Add a scholarship (admin)
app.post('/api/scholarships', async (req, res) => {
  const scholarship = new Scholarship(req.body);
  await scholarship.save();
  res.send({ message: 'Scholarship added' });
});

// Delete scholarship (admin)
app.delete('/api/scholarships/:id', async (req, res) => {
  await Scholarship.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Filter scholarships
app.get('/api/scholarships/filter', async (req, res) => {
  const filters = {};
  if (req.query.category) filters.category = req.query.category;
  if (req.query.state) filters.state = req.query.state;
  if (req.query.gender) filters.gender = req.query.gender;
  const data = await Scholarship.find(filters);
  res.json(data);
});

// Track application
app.post('/api/tracker', async (req, res) => {
  const tracker = new Tracker(req.body);
  await tracker.save();
  res.send({ message: 'Scholarship tracked' });
});

// Get tracked scholarships for a user
app.get('/api/tracker/:userId', async (req, res) => {
  const data = await Tracker.find({ userId: req.params.userId }).populate('scholarshipId');
  res.json(data);
});

// Get users (admin)
app.get('/api/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Delete user (admin)
app.delete('/api/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Submit feedback
app.post('/feedback', async (req, res) => {
  const feedback = new Feedback(req.body);
  await feedback.save();
  res.send({ message: 'Feedback submitted' });
});

// Get feedback (admin)
app.get('/api/feedback', async (req, res) => {
  const feedbacks = await Feedback.find();
  res.json(feedbacks);
});

// Reply to feedback (simulated)
app.post('/api/reply', (req, res) => {
  const { email, message } = req.body;
  console.log(`Reply to ${email}: ${message}`);
  res.sendStatus(200);
});

// Catch-all route to serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
