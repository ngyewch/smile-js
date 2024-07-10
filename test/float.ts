import t from 'tap';
import {approx, throws} from './utils/assert.js';
import {Float32, Float64} from '../src/float.js';
import {SmileError} from '../src/error.js';;

t.test('should decode 32-bit float values', t => {
    const bigEndianBytes = [0x44, 0x9a, 0x52, 0x25];
    approx(t, Float32.decode(new Uint8Array(bigEndianBytes)), 1234.567, 0.001);

    throws(t, () => {
        Float32.decode(new Uint8Array([0x00, 0x00]));
    }, e => e instanceof SmileError);

    t.end();
});

t.test('should decode 64-bit float values', t => {
    const bigEndianBytes = [0x41, 0x67, 0x8c, 0x29, 0xc3, 0xf3, 0x5b, 0xa7];
    approx(t, Float64.decode(new Uint8Array(bigEndianBytes)), 12345678.123456789, 0.000000001);

    throws(t, () => {
        Float64.decode(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    }, e => e instanceof SmileError);

    t.end();
});
