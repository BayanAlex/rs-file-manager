import { up, cd, ls, cat, add, rn, cp, mv, rm } from './fs.js';
import { os } from './os.js';
import { hash } from './hash.js';
import msg from './msg.js';
import { compress, decompress } from './archive.js';
import { homedir } from 'os';

let currentDir = homedir();
const printCurrentDir = () => process.stdout.write(`\nYou are currently in ${currentDir}\n> `);

const commandsList = { 
    fs: [up, cd, ls, cat, add, rn, cp, mv, rm],
    os: [os],
    hash: [hash],
    archive: [compress, decompress]
};

const allCommands = [];
for (const group in commandsList) {
    allCommands.push(...commandsList[group]);
}

const commandsMap = new Map();
allCommands.forEach(command => commandsMap.set(command.name, command));

process.stdin.on('data', processCommand);
process.stdin.setEncoding('utf-8');
printCurrentDir();

// -------------- functions --------------
async function processCommand(data) {
    const command = data.trim().replace(/\t/, ' ').split(' ')[0];

    if (command === '.exit') {
        process.exit(0);
    }

    if (!commandsMap.has(command)) {
        console.error(msg.INVALID_IN);
        printCurrentDir();
        return;
    }
    
    let strToParse = data.replace(command, '').trim();
    let args = [];
    try {
        args = parseArgs(strToParse);
        if (command !== 'os') {
            args.push(currentDir);
        }
        const output = await commandsMap.get(command)(...args);

        if (command === 'cd' || command === 'up') {
            currentDir = output;

        } else if (command === 'cat' || command === 'hash') {
            output.on('end', () => {
                command === 'cat' ? process.stdout.write('\n') : null;
                printCurrentDir();
            });
            output.on('error', () => {
                console.error(msg.OP_FAILED);
                printCurrentDir();
            });
            return;

        } else if (['cp', 'mv', 'compress', 'decompress'].includes(command)) {
            output.on('close', () => {
                console.log(msg.SUCCESS);
                printCurrentDir();
            });
            output.on('error', () => {
                console.error(msg.OP_FAILED);
                printCurrentDir();
            });
            return;
        }

    } catch (error) {
        console.error(error.message);
    }
    printCurrentDir();
}

function parseArgs(str) {
    let end;
    let args = [];
    while (str.length) {
        if (str[0] === '"') {
            end = str.indexOf('" ', 1);
            if (end === - 1 && str[str.length - 1] === '"') {
                end = str.length - 1;
            }
            if (end === -1 || end === 1) {
                throw new Error(msg.INVALID_IN);
            }
            args.push(str.slice(1, end));
            str = str.slice(end + 1).trim();
        } else {
            end = str.indexOf(' ', 1);
            if (end === -1) {
                end = str.length;
            }
            args.push(str.slice(0, end));
            str = str.slice(end + 1).trim();
        }
    }
    return args;
}
