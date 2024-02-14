import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { getAbsolutePath, fileExists, checkArgs } from './utils.js';
import msg from './msg.js';

export async function hash(filePath, currentDir) {
    checkArgs(arguments, 2);

    const sourcePath = getAbsolutePath(filePath, currentDir);
    if (!(await fileExists(sourcePath))) {
        throw new Error(msg.OP_FAILED);
    }
    
    let fileStream;
    try {
        fileStream = createReadStream(sourcePath);
        const hash = createHash('sha256');
        hash.setEncoding('hex');
        fileStream.on('end', () => {
            hash.end();
            console.log(`sha256 hash: ${hash.read()}`);
        });
        fileStream.pipe(hash);
    } catch {
        throw new Error(msg.OP_FAILED);
    }

    return fileStream;
};
