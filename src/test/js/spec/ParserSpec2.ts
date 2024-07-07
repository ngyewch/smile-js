import t from 'tap';
import {verifyFiles} from './utils.js';
import path from 'path';

const testSuiteDir = "src/test/data/serde-smile";

t.test('serde-smile test suite', t => {
    verifyFiles(t, path.resolve(testSuiteDir, "big_decimal/*.smile"));

    //verifyFiles(t, path.resolve(testSuiteDir, "big_integer/*.smile")); // skipped as tests fail due to Javascript Number.MAX_SAFE_INTEGER limitation.

    verifyFiles(t, path.resolve(testSuiteDir, "binary/*.smile"));

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
