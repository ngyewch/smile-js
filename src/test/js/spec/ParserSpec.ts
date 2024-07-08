import t from 'tap';
import {verifyFiles} from './utils.js';
import path from 'path';

const testSuiteDir = "src/test/data/basic";

t.test('basic test suite', t => {
    verifyFiles(t, path.resolve(testSuiteDir, "*.smile"));

    t.end()
});
