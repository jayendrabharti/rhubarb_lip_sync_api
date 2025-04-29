import express from 'express';
import cors from 'cors';
import { GenerateLipSyncLinux } from './rhubarb-linux/GenerateLipSync.js';
import { GenerateLipSyncWindows } from './rhubarb-windows/GenerateLipSync.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const system = process.env.SYSTEM;
        let data;
        if(system == "windows"){    
            data =await GenerateLipSyncWindows(audioBase64);
        } else{
            data =await GenerateLipSyncLinux(audioBase64);
        }
        console.log(data);
        res.send(JSON.stringify(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate lip sync', details: error.message });
    }
});

const PORT = process.env.port || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});