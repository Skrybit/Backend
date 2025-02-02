import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import multer from 'multer';
import { handleCommit } from './commit-endpoint.js';
import { handleCommitStatus } from './commit-status-endpoint.js';
import { handleReveal } from './reveal-endpoint.js';

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// API Routes

// 1. Commit Transaction - Now using the imported handler
app.post('/api/commit', upload.single('file'), handleCommit);

// 2. Get Commit Status
app.get('/api/commit/:txid/status', handleCommitStatus);

// 3. Create Reveal Transaction
app.post('/api/reveal', handleReveal);


// 4. Get Reveal Status
app.get('/api/reveal/:txid/status', (req, res) => {
    // TODO: Implement reveal status check
    res.json({ message: 'Reveal status endpoint' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});