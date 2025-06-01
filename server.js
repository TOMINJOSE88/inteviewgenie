
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./User');
require('dotenv').config();

jest.mock('axios');
dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Landing page route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

// Prevent caching for HTML
app.use((req, res, next) => {
  if (req.url.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});

// Session configuration
app.use(session({
  secret: 'interviewgenie-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3600000,
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    sameSite: 'lax'
  }
}));

// MongoDB connection (only connect when not testing)
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));
}

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed', detail: err.message });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = { id: user._id, name: user.name, email: user.email };
    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Check session
app.get('/check-session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

// Update profile
app.post('/update-profile', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, password } = req.body;
  try {
    const updates = { name };
    if (password) updates.password = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(req.session.user.id, updates);
    req.session.user.name = name;
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', detail: err.message });
  }
});

// Save Q&A
app.post('/save-qa', async (req, res) => {
  const { topic, content } = req.body;
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await User.findByIdAndUpdate(userId, {
      $push: { savedQA: { topic, content } }
    });
    res.json({ message: 'Q&A saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save Q&A' });
  }
});

// Get saved Q&A
app.get('/saved-qa', async (req, res) => {
  const userId = req.session.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await User.findById(userId);
    res.json(user.savedQA || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve saved Q&A' });
  }
});

// Delete Q&A
app.post('/delete-qa', async (req, res) => {
  const { topic } = req.body;
  const userId = req.session.user?.id;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { savedQA: { topic } }
    });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete Q&A' });
  }
});

// GPT generation
app.post('/generate', isAuthenticated, async (req, res) => {
  const { topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: `Generate 5 interview questions and answers on the topic "${topic}". Format them clearly.` }
        ],
        max_tokens: 800,
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || "No response.";
    res.json({ content: reply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Error from OpenAI API' });
  }
});

// ✅ Add a testable health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ✅ Export the app for Jest testing
module.exports = app;

// ✅ Start the server only if not in test
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  });
}
