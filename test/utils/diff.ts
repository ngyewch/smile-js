import {Test} from 'tap';
import {MessageExtra} from '@tapjs/core';
import {execSync, SpawnSyncReturns} from 'child_process';

export function jsonDiff(t: Test, file1: string, file2: string, ...[msg, extra]: MessageExtra): boolean {
    const cmd = `./json-diff ${file1} ${file2}`;
    return doExec(t, cmd, {
        msg: msg,
        ...extra,
    });
}

export function hdDiff(t: Test, file1: string, file2: string, ...[msg, extra]: MessageExtra): boolean {
    const cmd = `./hd-diff ${file1} ${file2}`;
    return doExec(t, cmd, {
        msg: msg,
        ...extra,
    });
}

function doExec(t: Test, cmd: string, ...[msg, extra]: MessageExtra): boolean {
    try {
        execSync(cmd);
        return t.pass({
            msg: msg,
            ...extra,
        });
    } catch (e) {
        const returns = e as SpawnSyncReturns<Buffer>;
        return t.fail({
            msg: msg,
            ...extra,
            doNotWant: returns.stdout.toString(),
        });
    }
}
