import t from 'tap';
import {calcByteLen, normalizeNumber} from '../src/utils.js';

t.test('should normalize number', t => {
    t.equal(normalizeNumber(0), 0);
    t.equal(normalizeNumber(BigInt(1)), 1);

    t.equal(normalizeNumber(BigInt("-1329227995784915872903807060280344576")), BigInt("-1329227995784915872903807060280344576"));

    t.end();
});

t.test('should calculate byte len', t => {
    t.equal(calcByteLen(4, 8, 7), 5);
    t.equal(calcByteLen(8, 8, 7), 10);

    t.end();
});