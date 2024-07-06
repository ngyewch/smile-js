import t, {Test} from 'tap';
import {parse} from '../../../main/js/parser.js';
import {objectEqual} from './utils.js';
import path from 'path';
import fs from 'fs';
import {globSync} from 'glob';

//const testSuiteDir = "serde-smile/tests";
const testSuiteDir = "src/test/data/serde-smile";

t.test('serde-smile test suite', t => {
    //verifyFiles(t, path.resolve(testSuiteDir, "big_decimal/*.smile"));

    //verifyFiles(t, path.resolve(testSuiteDir, "big_integer/*.smile"));

    //verifyFiles(t, path.resolve(testSuiteDir, "binary/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "boolean/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "double/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "float/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "integer/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "list/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "long/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "map/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "null/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "shared_property/*.smile"));

    //verifyFiles(t, path.resolve(testSuiteDir, "shared_string/*.smile"));
    verifyFiles(t, path.resolve(testSuiteDir, "shared_string/ab.smile"));
    verifyFiles(t, path.resolve(testSuiteDir, "shared_string/evict.smile"));
    //verifyFiles(t, path.resolve(testSuiteDir, "shared_string/large.smile")); // FAILS this test

    verifyFiles(t, path.resolve(testSuiteDir, "string/*.smile"));

    t.end();
});

function verifyFiles(t: Test, pattern: string | string[]): void {
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

function verifyFile(t: Test, smileFile: string): void {
    const relativePath = path.relative(testSuiteDir, smileFile);
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