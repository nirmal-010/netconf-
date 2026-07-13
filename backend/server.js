const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Initialize global in-memory fallback stores for offline/disconnected MongoDB mode
global.inMemoryUsers = global.inMemoryUsers || new Map([
  ['admin', { id: 'demo-admin-id-12345', username: 'admin', password: 'admin123' }]
]);
global.inMemoryProgress = global.inMemoryProgress || new Map();

// Connect to MongoDB with short timeout to prevent 10000ms buffering freeze
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://Nirmal:Nirmal%40123@nirmal.vpb304l.mongodb.net/netconfig';
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000
})
.then(() => console.log('✅ MongoDB Connected successfully!'))
.catch(err => {
  console.log('⚠️ MongoDB Connection Error (cloud cluster unreachable / IP restricted):', err.message);
  console.log('💡 Switched to 0ms In-Memory Fallback Database mode. Login (admin/admin123) and register will work instantly without errors.');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/progress', require('./routes/progress'));

const PORT = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`🚀 Express Server started on port ${PORT}`));
}

module.exports = app;
