import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function GenerateLipSyncWindows(audioBase64) {

    const audioBuffer = Buffer.from(audioBase64, 'base64');

    function runCommand(command, args){
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, { shell: false });

            let stderr = '';

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('error', (err) => {
                reject(new Error(`Failed to start process: ${err.message}`));
            });

            child.on('close', (code) => {
                if (code !== 0) {
                    return reject(new Error(`Process exited with code ${code}. Stderr: ${stderr}`));
                }
                resolve();
            });
        });
    }

    const tempId = randomUUID();
    const cwd = process.cwd();
    const dirPath = path.join(cwd, 'rhubarb');

    const rhubarbPath = path.join(dirPath, 'rhubarb.exe');
    const inputFilePath = path.join(dirPath, `temp-${tempId}.wav`);
    const outputFilePath = path.join(dirPath, `temp-${tempId}.json`);

    try {
        // Write buffer to temp input file
        await fs.writeFile(inputFilePath, audioBuffer);

        // Run Rhubarb
        const args = ['-f', 'json', inputFilePath, '-o', outputFilePath];
        await runCommand(rhubarbPath, args);

        // Read and return the output
        const outputContent = await fs.readFile(outputFilePath, 'utf8');

        return outputContent;

    } catch (error) {
        console.error('Error in GenerateLipSync:', error);
        throw error;
    } finally {
        // Cleanup temp files
        await Promise.allSettled([
            fs.unlink(inputFilePath),
            fs.unlink(outputFilePath)
        ]);
    }
}
