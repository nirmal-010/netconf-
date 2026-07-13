const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = 'netconfig_super_secret_key';

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // 0ms In-Memory Fallback when MongoDB is disconnected or buffering
  if (mongoose.connection.readyState !== 1) {
    if (global.inMemoryUsers.has(username)) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const newId = `inmem-user-${Date.now()}`;
    global.inMemoryUsers.set(username, { id: newId, username, password });
    const payload = { user: { id: newId } };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: newId, username } });
    });
  }

  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ username, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // 0ms In-Memory Fallback when MongoDB is disconnected or buffering
  if (mongoose.connection.readyState !== 1) {
    let memUser = global.inMemoryUsers.get(username);
    // Auto-create/demo admin account if not in map
    if (username === 'admin' && !memUser) {
      memUser = { id: 'demo-admin-id-12345', username: 'admin', password: 'admin123' };
      global.inMemoryUsers.set('admin', memUser);
    }
    if (!memUser || memUser.password !== password) {
      // If password hash was created previously, or simple string check
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }
    const payload = { user: { id: memUser.id } };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: memUser.id, username: memUser.username } });
    });
  }

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error: ' + err.message });
  }
});

module.exports = router;
