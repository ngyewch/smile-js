import t from 'tap';
import path from 'path';
import {verifyFiles} from './utils/helper.js';

const testSuiteDir = "testdata/serde-smile";

t.test('serde-smile test suite', t => {
    verifyFiles(t, path.resolve(testSuiteDir, "big_decimal/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "big_integer/*.smile"));

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

    verifyFiles(t, path.resolve(testSuiteDir, "shared_string/*.smile"));

    verifyFiles(t, path.resolve(testSuiteDir, "string/*.smile"));

    t.end();
});
