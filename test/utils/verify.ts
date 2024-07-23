import {Test} from 'tap';
import {globSync} from 'glob';
import path from 'path';
import fs from 'fs';
import {parse, stringify} from 'lossless-json';
import {decode} from '../../src/decoder.js';
import {encode, type EncoderOptions} from '../../src/encoder.js';
import {objectEqual} from './assert.js';
import {jsonParseNumber} from '../../src/utils.js';

export interface VerifyOptions {
    adjustDecodedValue?: (v: any) => any;
    equal?: (t: Test, smileFile: string, found: any, wanted: any) => boolean;
}

const defaultVerifyOptions: VerifyOptions = {};

export function verifyFiles(t: Test, pattern: string | string[], options?: VerifyOptions): void {
    const smileFiles = globSync(pattern, {
        nodir: true,
    })
        .filter(smileFile => {
            const jsonFile = replaceExtension(smileFile, '.json');
            return fs.existsSync(jsonFile);
        });
    for (const smileFile of smileFiles) {
        verifyFile(t, smileFile, options);
    }
}

interface WrappedJSONValue {
    sharedStrings?: boolean;
    sharedProperties?: boolean;
    rawBinary?: boolean;
    value: any;
}

export function verifyFile(t: Test, smileFile: string, options?: VerifyOptions): void {
    const relativePath = path.relative(process.cwd(), smileFile);
    t.test(relativePath, t => {
        const opts = {
            defaultVerifyOptions,
            ...options,
        }

        const jsonFile = replaceExtension(smileFile, '.json');
        const smileValue = loadSmileFromFile(smileFile);
        const wrappedJsonValue = loadWrappedJsonFromFile(jsonFile);
        const originalJsonValue = wrappedJsonValue.value;
        const jsonValue = (opts.adjustDecodedValue !== undefined) ? opts.adjustDecodedValue(originalJsonValue) : originalJsonValue;

        const decodePassed = (opts.equal !== undefined) ? opts.equal(t, relativePath, smileValue, jsonValue) : objectEqual(t, smileValue, jsonValue);

        const outputWrappedJsonValue = {
            ...wrappedJsonValue,
            value: smileValue,
        };
        const outputJsonFile = path.resolve('build/test-output',
            path.relative(process.cwd(), replaceExtension(smileFile, ".json")));
        saveWrappedJsonToFile(outputJsonFile, outputWrappedJsonValue);

        if (decodePassed) {
            const outputSmileFile = path.resolve('build/test-output', relativePath);
            saveSmileFile(outputSmileFile, smileValue, {
                sharedPropertyName: (wrappedJsonValue.sharedProperties !== undefined) ? wrappedJsonValue.sharedProperties : false,
                sharedStringValue: (wrappedJsonValue.sharedStrings !== undefined) ? wrappedJsonValue.sharedStrings : false,
                rawBinary: (wrappedJsonValue.rawBinary !== undefined) ? wrappedJsonValue.rawBinary : false,
            });
            const outputSmileValue = loadSmileFromFile(outputSmileFile);

            const decodeEncodedPassed = (opts.equal !== undefined) ? opts.equal(t, relativePath, outputSmileValue, jsonValue) : objectEqual(t, outputSmileValue, jsonValue);
        }

        t.end();
    });
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
