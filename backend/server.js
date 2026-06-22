const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/netconfig';
mongoose.connect(mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));

const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Express Server started on port ${PORT}`));
}

module.exports = app;
