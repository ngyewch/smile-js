import t from 'tap';
import path from 'path';
import {verifyFiles} from './utils/helper.js';

const testSuiteDir = "src/test/data/basic";

t.test('basic test suite', t => {
    verifyFiles(t, path.resolve(testSuiteDir, "*.smile"));

    t.end()
});
