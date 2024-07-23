import t from 'tap';
import path from 'path';
import {verifyFiles} from './utils/verify.js';

const testSuiteDir = "testdata/basic";

verifyFiles(t, path.resolve(testSuiteDir, "*.smile"));
