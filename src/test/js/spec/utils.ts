import {Test} from 'tap';
import {MessageExtra} from '@tapjs/core';
import testDiff from 'js-testdiff';
import {globSync} from 'glob';
import path from 'path';
import fs from 'fs';
import {parse} from '../../../main/js/parser.js';

export function arrayEqual(t: Test, found: Uint8Array, wanted: Uint8Array, ...[msg, extra]: MessageExtra): boolean {
    if (found.length != wanted.length) {
        return t.fail({
            msg: msg,
            ...extra,
            wanted: wanted,
            found: found,
        });
    }
    for (let i = 0; i < found.length; i++) {
        if (found[i] != wanted[i]) {
            return t.fail({
                msg: msg,
                ...extra,
                wanted: wanted,
                found: found,
            });
        }
    }
    return t.pass({
        msg: msg,
        ...extra,
    });
}

export function approx(t: Test, found: number, wanted: number, epsilon: number, ...[msg, extra]: MessageExtra): boolean {
    const diff = Math.abs(found - wanted);
    if (diff <= epsilon) {
        return t.pass({
            msg: msg,
            ...extra,
        });
    } else {
        return t.fail({
            msg: msg,
            ...extra,
            wanted: wanted,
            found: found,
        });
    }
}

export function objectEqual(t: Test, found: any, wanted: any, ...[msg, extra]: MessageExtra): boolean {
    const diff = testDiff(found, wanted);
    if (!diff) {
        return t.pass({
            msg: msg,
            ...extra,
        });
    } else {
        return t.fail({
            msg: msg,
            ...extra,
            wanted: wanted,
            found: found,
        });
    }
}

export function verifyFiles(t: Test, pattern: string | string[]): void {
    const smileFiles = globSync(pattern, {
        nodir: true,
    })
        .filter(smileFile => {
            const parsedPath = path.parse(smileFile);
            const jsonFile = path.resolve(parsedPath.dir, parsedPath.name + ".json");
            return fs.existsSync(jsonFile);
        });
    for (const smileFile of smileFiles) {
        verifyFile(t, smileFile);
    }
}

export function verifyFile(t: Test, smileFile: string): void {
    const relativePath = path.relative(process.cwd(), smileFile);
    console.log(`[${relativePath}] ------------------------------`);
    t.test(relativePath, t => {
        const parsedPath = path.parse(smileFile);
        const jsonFile = path.resolve(parsedPath.dir, parsedPath.name + ".json");
        const smileData = fs.readFileSync(smileFile);
        const jsonData = fs.readFileSync(jsonFile);
        const smileValue = parse(smileData);
        const wrappedSmileValue = {
            value: smileValue,
        };
        const jsonValue = JSON.parse(jsonData.toString());
        const jsonKeys = Object.keys(jsonValue);
        for (const jsonKey of jsonKeys) {
            if (jsonKey === 'value') {
                continue;
            }
            delete jsonValue[jsonKey];
        }
        objectEqual(t, wrappedSmileValue, jsonValue);
        t.end();
    });
}
