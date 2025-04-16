const express = require('express');
const dotenv = require('dotenv');
const ingestionRoutes = require('./routes/ingestion');
const cors = require('cors');

dotenv.config();
const app = express();
app.use(cors('*'));
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/ingestion', ingestionRoutes);

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
