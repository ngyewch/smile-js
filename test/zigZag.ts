import t from 'tap';
import {SmileError} from '../src/error.js';
import {ZigZag} from '../src/zigZag.js';
import {throws} from './utils/assert.js';

t.test('zigZag decode', t => {
    t.equal(ZigZag.decode(0), 0);
    t.equal(ZigZag.decode(1), -1);
    t.equal(ZigZag.decode(2), 1);
    t.equal(ZigZag.decode(3), -2);

    t.equal(ZigZag.decode(BigInt(0)), 0);
    t.equal(ZigZag.decode(BigInt(1)), -1);
    t.equal(ZigZag.decode(BigInt(2)), 1);
    t.equal(ZigZag.decode(BigInt(3)), -2);

    t.equal(ZigZag.decode(9007199254740991), -4503599627370496);
    t.equal(ZigZag.decode(BigInt("9007199254740992")), 4503599627370496);

    t.equal(ZigZag.decode(BigInt("2658455991569831745807614120560689152")), BigInt("1329227995784915872903807060280344576"));
    t.equal(ZigZag.decode(BigInt("2658455991569831745807614120560689151")), BigInt("-1329227995784915872903807060280344576"));

    throws(t, () => {
        ZigZag.decode(-1);
    }, e => e instanceof SmileError);

    t.end();
});

t.test('zigZag encode', t => {
    t.equal(ZigZag.encode(0), 0);
    t.equal(ZigZag.encode(-1), 1);
    t.equal(ZigZag.encode(1), 2);
    t.equal(ZigZag.encode(-2), 3);

    t.equal(ZigZag.encode(BigInt(0)), 0);
    t.equal(ZigZag.encode(BigInt(-1)), 1);
    t.equal(ZigZag.encode(BigInt(1)), 2);
    t.equal(ZigZag.encode(BigInt(-2)), 3);

    t.equal(ZigZag.encode(-4503599627370496), 9007199254740991);
    t.equal(ZigZag.encode(4503599627370496), BigInt("9007199254740992"));

    t.equal(ZigZag.encode(BigInt("1329227995784915872903807060280344576")), BigInt("2658455991569831745807614120560689152"));
    t.equal(ZigZag.encode(BigInt("-1329227995784915872903807060280344576")), BigInt("2658455991569831745807614120560689151"));

    t.end();
});
