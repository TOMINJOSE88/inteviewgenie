const mongoose = require('mongoose');

const savedQASchema = new mongoose.Schema({
  topic: { type: String, required: true },
  content: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  savedQA: [savedQASchema]
});

module.exports = mongoose.model('User', userSchema);
