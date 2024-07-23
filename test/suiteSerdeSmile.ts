import t, {Test} from 'tap';
import path from 'path';
import {Base64} from 'js-base64';
import {verifyFiles} from './utils/verify.js';
import {approx} from './utils/assert.js';

const testSuiteDir = "testdata/serde-smile";

verifyFiles(t, path.resolve(testSuiteDir, "big_decimal/*.smile"), {
    equal: (t: Test, relativePath: string, found: any, wanted: any): boolean => approx(t, found, wanted, 0.0000001),
});
verifyFiles(t, path.resolve(testSuiteDir, "big_integer/*.smile"), {
    adjustDecodedValue: (v: any): any => (typeof v === 'number') ? BigInt(v) : v,
});
verifyFiles(t, path.resolve(testSuiteDir, "binary/*.smile"), {
    adjustDecodedValue: (v: any): any => (typeof v === 'string') ? Base64.toUint8Array(v) : v,
});
verifyFiles(t, path.resolve(testSuiteDir, "boolean/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "double/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "float/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "integer/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "list/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "long/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "map/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "null/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "shared_property/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "shared_string/*.smile"));
verifyFiles(t, path.resolve(testSuiteDir, "string/*.smile"));
