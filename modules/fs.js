import path from 'path';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { checkDir, checkArgs, getAbsolutePath, fileExists } from './utils.js';
import msg from './msg.js';

export function up(currentDir) {
    checkArgs(arguments, 1);
    return cd('..', currentDir);
}

export async function cd(cdDir, currentDir) {
    checkArgs(arguments, 2);

    if (cdDir === '/' || cdDir === '\\') {
        return path.parse(currentDir).root;
    }

    const newDirPath = getAbsolutePath(cdDir, currentDir);
    await checkDir(newDirPath);
    return fs.realpath(newDirPath);
}

export async function ls(currentDir) {
    checkArgs(arguments, 1);

    const list = (await fs.readdir(currentDir, { withFileTypes: true }))
        .reduce((res, v) => {
            const type = v.isDirectory() ? 'directory' : 'file';
            res[type].push({ Name: v.name, Type: type});
            return res;
        }, { directory: [], file: []});
    const sortFunc = (a, b) => a.Name > b.Name ? 1 : -1;
    list.directory.sort(sortFunc);
    list.file.sort(sortFunc);
    const result = [...list.directory, ...list.file];
    if (!result.length) {
        console.log('Directory is empty');
        return;
    }
    console.table(result);
}

export async function add(name, currentDir) {
    checkArgs(arguments, 2);

    try {
        await fs.writeFile(path.resolve(currentDir, name), '', { flag: 'wx' });
    } catch {
        throw new Error(msg.OP_FAILED);
    }
    console.log('File has been created');
}

export async function rn(filePath, newName, currentDir) {
    checkArgs(arguments, 3);

    const oldPath = getAbsolutePath(filePath, currentDir);
    try {
        await fs.rename(oldPath, path.resolve(path.dirname(oldPath), newName));
    } catch {
        throw new Error(msg.OP_FAILED);
    }
}

export function cat(filePath, currentDir) {
    checkArgs(arguments, 2);
    let fileStream;
    try {
        fileStream = createReadStream(getAbsolutePath(filePath, currentDir), { encoding: 'utf-8' });
        fileStream.pipe(process.stdout);
    } catch (error) {
        throw new Error(msg.OP_FAILED);
    }
    return fileStream;
}

export async function cp(source, dest, currentDir) {
    checkArgs(arguments, 3);

    let fileStream;
    const sourcePath = getAbsolutePath(source, currentDir);
    const destPath = path.resolve(getAbsolutePath(dest, currentDir), path.basename(source));
    
    if (!(await fileExists(sourcePath)) || await fileExists(destPath)) {
        throw new Error(msg.OP_FAILED);
    }

    try {
        const readStream = createReadStream(sourcePath);
        const writeStream = createWriteStream(destPath);
        readStream.on('error', () => {});
        writeStream.on('error', () => {});
        fileStream = pipeline(readStream, writeStream, () => {});
    } catch (error) {
        throw new Error(msg.OP_FAILED);
    }

    return fileStream;
}

export async function mv(source, dest, currentDir) {
    checkArgs(arguments, 3);

    let fileStream;
    try {
        fileStream = await cp(source, dest, currentDir);
    } catch (error) {
        throw new Error(msg.OP_FAILED);
    }
    fileStream.on('ready', () => rm(source, currentDir));

    return fileStream;
}

export async function rm(filePath, currentDir) {
    checkArgs(arguments, 2);

    const absolutePath = getAbsolutePath(filePath, currentDir);
    try {
        await fs.rm(absolutePath);
    } catch {
        throw new Error(msg.OP_FAILED);
    }
}
