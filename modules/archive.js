import { createReadStream, createWriteStream } from 'fs';
import zlib from 'zlib';
import { pipeline } from 'stream';
import { fileExists, checkArgs, getAbsolutePath } from './utils.js';
import msg from './msg.js';

export async function compress(source, dest, currentDir) {
    checkArgs(arguments, 3);
    return archive(source, dest, currentDir);
}

export async function decompress(source, dest, currentDir) {
    checkArgs(arguments, 3);
    return archive(source, dest, currentDir, true);
}

async function archive(source, dest, currentDir, decompress = false) {
    let fileStream;
    const sourcePath = getAbsolutePath(source, currentDir);
    const compressExt = dest.endsWith('.gz') ? '' :  '.gz';
    const destPath = getAbsolutePath(dest + (decompress ? '' : compressExt), currentDir);

    if (!(await fileExists(sourcePath)) || await fileExists(destPath)) {
        throw new Error(msg.OP_FAILED);
    }

    try {
        const readStream = createReadStream(sourcePath);
        const writeStream = createWriteStream(destPath);
        const arch = decompress ? zlib.createBrotliDecompress() : zlib.createBrotliCompress();
        readStream.on('error', () => {});
        writeStream.on('error', () => {});
        fileStream = pipeline(readStream, arch, writeStream, () => {});
    } catch (error) {
        throw new Error(msg.OP_FAILED);
    }

    return fileStream;
}
