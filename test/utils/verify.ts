import {Test} from 'tap';
import {globSync} from 'glob';
import path from 'path';
import fs from 'fs';
import {parse, stringify, isInteger} from 'lossless-json';
import {decode} from '../../src/decoder.js';
import {encode} from '../../src/encoder.js';
import {objectEqual} from './assert.js';
import {jsonDiff} from './jsonDiff.js';

export function verifyFiles(t: Test, pattern: string | string[]): void {
    const smileFiles = globSync(pattern, {
        nodir: true,
    })
        .filter(smileFile => {
            const jsonFile = replaceExtension(smileFile, '.json');
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
        const jsonFile = replaceExtension(smileFile, '.json');
        const smileValue = loadSmileFromFile(smileFile);
        const wrappedJsonValue = loadWrappedJsonFromFile(jsonFile);
        const jsonValue = wrappedJsonValue.value;
        const pass = objectEqual(t, smileValue, jsonValue);

        const outputWrappedJsonValue = {
            ...wrappedJsonValue,
            value: smileValue,
        };
        const outputJsonFile = path.resolve('build/test-output',
            path.relative(process.cwd(), replaceExtension(smileFile, ".json")));
        saveWrappedJsonToFile(outputJsonFile, outputWrappedJsonValue);

        if (pass) {
            if (!skipEncoderTest(relativePath)) {
                const outputSmileFile = path.resolve('build/test-output', relativePath);
                saveSmileFile(outputSmileFile, smileValue);
                const outputSmileValue = loadSmileFromFile(outputSmileFile);
                objectEqual(t, outputSmileValue, jsonValue);
            }

            if (!skipJsonDiff(relativePath)) {
                t.test('json diff', t => {
                    jsonDiff(t, jsonFile, outputJsonFile);
                    t.end();
                });
            }
        }

        t.end();
    });
}

function skipEncoderTest(relativePath: string): boolean {
    return false;
}

function noSkipJsonDiff(relativePath: string): boolean {
    return false;
}

function skipJsonDiff(relativePath: string): boolean {
    return relativePath.startsWith('testdata/serde-smile/double/')
        || relativePath.startsWith('testdata/serde-smile/float/');
}

function replaceExtension(p: string, ext: string): string {
    const parsedPath = path.parse(p);
    return path.resolve(parsedPath.dir, parsedPath.name + ext);
}

function parseNumber(v: string): unknown {
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
}

function loadWrappedJsonFromFile(filename: string): WrappedJSONValue {
    return parse(fs.readFileSync(filename).toString(), null, parseNumber) as WrappedJSONValue;
}

function loadSmileFromFile(filename: string): any {
    return decode(fs.readFileSync(filename));
}

function saveWrappedJsonToFile(filename: string, wrappedJsonValue: WrappedJSONValue): void {
    const jsonString = stringify(wrappedJsonValue);
    if (jsonString === undefined) {
        throw new Error('could not stringify JSON');
    }
    fs.mkdirSync(path.parse(filename).dir, {recursive: true});
    fs.writeFileSync(filename, jsonString);
}

function saveSmileFile(filename: string, value: any): void {
    const encodedData = encode(value);
    fs.mkdirSync(path.parse(filename).dir, {recursive: true});
    fs.writeFileSync(filename, encodedData);
}
