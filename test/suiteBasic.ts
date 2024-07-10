import t from 'tap';
import path from 'path';
import {verifyFiles} from './utils/verify.js';

const testSuiteDir = "testdata/basic";

t.test('basic test suite', t => {
    verifyFiles(t, path.resolve(testSuiteDir, "*.smile"));

    t.end()
});
