import {Test} from 'tap';
import {globSync} from 'glob';
import path from 'path';
import fs from 'fs';
import {execSync, type SpawnSyncReturns} from 'child_process';
import {parse as jsonParse, stringify as jsonStringify, isInteger} from 'lossless-json';
import {decode} from '../../src/decoder.js';
import {objectEqual} from './assert.js';

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

interface WrappedJSONValue {
    sharedStrings?: boolean;
    sharedProperties?: boolean;
    rawBinary?: boolean;
    value: any;
}

export function verifyFile(t: Test, smileFile: string): void {
    const relativePath = path.relative(process.cwd(), smileFile);
    //console.log(`[${relativePath}] ------------------------------`);
    t.test(relativePath, t => {
        const parsedPath = path.parse(smileFile);
        const jsonFile = path.resolve(parsedPath.dir, parsedPath.name + ".json");
        const smileData = fs.readFileSync(smileFile);
        const jsonData = fs.readFileSync(jsonFile);
        const smileValue = decode(smileData);
        const wrappedJsonValue = jsonParse(jsonData.toString(), null, v => {
            if (isInteger(v)) {
                const b = BigInt(v);
                if ((b >= BigInt(Number.MIN_SAFE_INTEGER)) && (b <= BigInt(Number.MAX_SAFE_INTEGER))) {
                    return Number(b);
                } else {
                    return b;
                }
            } else {
                return parseFloat(v);
            }
        }) as WrappedJSONValue;
        const jsonValue = wrappedJsonValue.value;
        const pass = objectEqual(t, smileValue, jsonValue);
        const skipJsonDiff = relativePath.startsWith('testdata/serde-smile/double/')
            || relativePath.startsWith('testdata/serde-smile/float/');

        if (pass && !skipJsonDiff) {
            t.test('json diff', t => {
                wrappedJsonValue.value = smileValue;
                const outputJson = jsonStringify(wrappedJsonValue);
                if (outputJson !== undefined) {
                    const parsedPath2 = path.parse(relativePath);
                    const outputJsonFile = path.resolve('build/test-output', parsedPath2.dir, parsedPath2.name + ".json");
                    fs.mkdirSync(path.parse(outputJsonFile).dir, {recursive: true});
                    fs.writeFileSync(outputJsonFile, outputJson);

                    const jsonDiffCmd = `./json-diff ${jsonFile} ${outputJsonFile}`;
                    try {
                        const jsonDiff = execSync(jsonDiffCmd);
                    } catch (e) {
                        const returns = e as SpawnSyncReturns<Buffer>;
                        t.fail({
                            doNotWant: returns.stdout.toString(),
                        });
                    }
                } else {
                    t.fail('could not write output JSON');
                }

                t.end();
            });
        }

        t.end();
    });
}
