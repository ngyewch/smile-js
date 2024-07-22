import {Test} from 'tap';
import {globSync} from 'glob';
import path from 'path';
import fs from 'fs';
import {parse, stringify} from 'lossless-json';
import {decode} from '../../src/decoder.js';
import {encode, type EncoderOptions} from '../../src/encoder.js';
import {approx, objectEqual} from './assert.js';
import {jsonDiff, hdDiff} from './diff.js';
import {jsonParseNumber} from '../../src/utils.js';
import {Base64} from 'js-base64';

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
        let jsonValue = wrappedJsonValue.value;
        if (relativePath.startsWith('testdata/serde-smile/binary/')) {
            if (typeof jsonValue === 'string') {
                jsonValue = Base64.toUint8Array(jsonValue);
            }
        }
        const decodePassed = (): boolean => {
            if (relativePath.startsWith('testdata/serde-smile/big_decimal/')) {
                return approx(t, smileValue as number, jsonValue as number, 0.00000001)
            } else {
                return objectEqual(t, smileValue, jsonValue);
            }
        }

        const outputWrappedJsonValue = {
            ...wrappedJsonValue,
            value: smileValue,
        };
        const outputJsonFile = path.resolve('build/test-output',
            path.relative(process.cwd(), replaceExtension(smileFile, ".json")));
        saveWrappedJsonToFile(outputJsonFile, outputWrappedJsonValue);

        if (decodePassed) {
            if (!skipEncoderTest(relativePath)) {
                const outputSmileFile = path.resolve('build/test-output', relativePath);
                saveSmileFile(outputSmileFile, smileValue, {
                    sharedPropertyName: (wrappedJsonValue.sharedProperties !== undefined) ? wrappedJsonValue.sharedProperties : false,
                    sharedStringValue: (wrappedJsonValue.sharedStrings !== undefined) ? wrappedJsonValue.sharedStrings : false,
                    rawBinary: (wrappedJsonValue.rawBinary !== undefined) ? wrappedJsonValue.rawBinary : false,
                });
                const outputSmileValue = loadSmileFromFile(outputSmileFile);
                const encodePassed = (): boolean => {
                    if (relativePath.startsWith('testdata/serde-smile/big_decimal/')) {
                        return approx(t, outputSmileValue as number, jsonValue as number, 0.00000001)
                    } else {
                        return objectEqual(t, outputSmileValue, jsonValue);
                    }
                }

                if (encodePassed) {
                    if (!skipHdDiff(relativePath)) {
                        t.test('hd diff', t => {
                            hdDiff(t, smileFile, outputSmileFile);
                            t.end();
                        });
                    }
                }
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
    return relativePath.startsWith('testdata/serde-smile/big_decimal/')
        || relativePath.startsWith('testdata/serde-smile/binary/')
        || relativePath.startsWith('testdata/serde-smile/double/')
        || relativePath.startsWith('testdata/serde-smile/float/');
}

function skipHdDiff(relativePath: string): boolean {
    return relativePath.startsWith('testdata/serde-smile/big_decimal/')
        || (relativePath === 'testdata/serde-smile/double/0.0.smile')
        || (relativePath === 'testdata/serde-smile/double/-0.0.smile')
        || (relativePath === 'testdata/serde-smile/float/0.0.smile')
        || (relativePath === 'testdata/serde-smile/float/-0.0.smile')
        || (relativePath === 'testdata/serde-smile/float/100.25.smile')
        || (relativePath === 'testdata/serde-smile/float/-100.25.smile')
        || (relativePath === 'testdata/serde-smile/shared_property/evict.smile');
}

function replaceExtension(p: string, ext: string): string {
    const parsedPath = path.parse(p);
    return path.resolve(parsedPath.dir, parsedPath.name + ext);
}

function loadWrappedJsonFromFile(filename: string): WrappedJSONValue {
    return parse(fs.readFileSync(filename).toString(), null, jsonParseNumber) as WrappedJSONValue;
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

function saveSmileFile(filename: string, value: any, options?: EncoderOptions): void {
    const encodedData = encode(value, options);
    fs.mkdirSync(path.parse(filename).dir, {recursive: true});
    fs.writeFileSync(filename, encodedData);
}
