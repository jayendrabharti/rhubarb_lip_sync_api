import express from 'express';
import cors from 'cors';
import { GenerateLipSync } from './rhubarb/GenerateLipSync.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// Enable CORS for all requests
app.use(cors());

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '50mb' })); // To parse JSON bodies with a larger limit

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});


app.post('/getlipsync', async (req, res) => {
    const { audioBase64 } = req.body;
    if (!audioBase64) {
        return res.status(400).json({ error: 'audioBuffer is required' });
    }

    try {
        console.log("genrating...");
        const data = await GenerateLipSync(audioBase64);
        console.log(data);
        res.send(JSON.stringify(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate lip sync', details: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});