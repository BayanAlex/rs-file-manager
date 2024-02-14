import path from 'path';
import fs from 'fs/promises';
import msg from './msg.js';

export async function checkDir(dir) {
    try {
        await fs.access(dir) && (await fs.stat(dir)).isDirectory();
    } catch {
        throw new Error(msg.OP_FAILED);
    }
}

export function checkArgs(args, validCount) {
    if (args.length !== validCount) {
        throw new Error(msg.INVALID_IN);
    }
}

export function getAbsolutePath(inputPath, currentDir) {
    let absolutePath = inputPath;
    if (!path.isAbsolute(absolutePath)) {
        absolutePath = path.resolve(currentDir, absolutePath);
    }
    return absolutePath;
}

export async function fileExists(filePath) {
    let destFileExists = false;
    try {
        await fs.access(filePath);
        destFileExists = true;
    } catch (error) {}
    return destFileExists;
}
