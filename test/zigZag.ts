import t from 'tap';
import {SmileError} from '../src/error.js';
import {ZigZag} from '../src/zigZag.js';

t.test('should decode ZigZag encoded values', t => {
    t.equal(ZigZag.decode(0), 0);
    t.equal(ZigZag.decode(1), -1);
    t.equal(ZigZag.decode(2), 1);
    t.equal(ZigZag.decode(3), -2);
    t.equal(ZigZag.decode(4294967294), 2147483647);
    t.equal(ZigZag.decode(4294967295), -2147483648);
    t.equal(ZigZag.decode(9007199254740990), 4503599627370495);
    t.equal(ZigZag.decode(9007199254740991), -4503599627370496);

    try {
        ZigZag.decode(-1);
        t.fail();
    } catch (e) {
        t.ok(e instanceof SmileError);
    }

    t.end();
});
