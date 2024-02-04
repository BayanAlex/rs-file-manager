import { EOL, cpus, homedir, userInfo, arch } from 'os';
import { checkArgs } from './utils.js';
import msg from './msg.js';

export function os(param) {
    checkArgs(arguments, 1);

    if (param === '--EOL') {
        console.log(JSON.stringify(EOL));
        return;
    }

    if (param === '--cpus') {
        console.log(`Total CPUs: ${cpus().length}`)
        console.table(cpus().map(cpu => ({ Model: cpu.model.trim(), Clock: `${cpu.speed} MHz` })));
        return;
    }

    if (param === '--homedir') {
        console.log(homedir());
        return;
    }
    
    if (param === '--username') {
        console.log(userInfo().username);
        return;
    } 
    
    if (param === '--architecture') {
        console.log(arch());
        return;
    }

    throw new Error(msg.INVALID_IN);
}
