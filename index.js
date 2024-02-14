import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = getArgs();
const username = args.find(arg => arg.param === 'username' && arg.value)?.value ?? 'User';
console.log(`Welcome to the File Manager, ${username}!`);

fork(path.resolve(__dirname, 'modules', 'prompt.js'));

process.on('SIGINT', () => {
    process.exit(0);
});

process.on('exit', () => console.log(`Thank you for using File Manager, ${username}, goodbye!`));

function getArgs() {
    return process.argv
        .slice(2)
        .filter((arg) => /(^--).+=.+/.test(arg))
        .map((arg) => {
            const [param, value] = arg.slice(2).split('=');
            return { param, value };
        });
}
