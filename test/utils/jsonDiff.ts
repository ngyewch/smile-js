import {Test} from 'tap';
import {MessageExtra} from '@tapjs/core';
import {execSync, SpawnSyncReturns} from 'child_process';

export function jsonDiff(t: Test, jsonFile1: string, jsonFile2: string, ...[msg, extra]: MessageExtra): boolean {
    const jsonDiffCmd = `./json-diff ${jsonFile1} ${jsonFile2}`;
    try {
        execSync(jsonDiffCmd);
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
