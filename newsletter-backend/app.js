const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');

const app = express();
const port = process.env.PORT || 3002;

mongoose.connect('mongodb+srv://adityarv0909:dvJlni3GAE50am1Q@newsletter.ruwkohe.mongodb.net/?retryWrites=true&w=majority&appName=newsletter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);

app.listen(port, () => {
  console.log(`Server running on port number ${port}`);
});
