/**
 * Express server entrypoint for Begging Rights backend.
 * Sets up middleware and registers API routes used by the frontend and devices.
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(require('./routes/status.routes'));
app.use(require('./routes/lock.routes'));
app.use(require('./routes/admin.routes'));
app.use(require('./routes/plead.routes'));
app.use(require('./routes/tts.routes'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});