import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export async function GenerateLipSyncLinux(audioBase64) {
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    function runCommand(command, args) {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                shell: false,
                cwd: process.cwd(),
            });

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
    const dirPath = path.join(cwd, 'rhubarb-linux');

    const rhubarbPath = path.join(dirPath, 'rhubarb'); // Linux binary — no .exe
    const inputFilePath = path.join(dirPath, `temp-${tempId}.wav`);
    const outputFilePath = path.join(dirPath, `temp-${tempId}.json`);

    try {
        // Ensure the binary is executable
        await fs.chmod(rhubarbPath, 0o755);

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
