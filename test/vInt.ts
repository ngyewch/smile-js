import t, {Test} from 'tap';
import {VInt} from '../src/vInt.js';
import {SmileError} from '../src/error.js';
import {InputStream} from '../src/inputStream.js';
import {throws} from './utils/assert.js';

t.test('should decode VInt values', t => {
    decodeAndRead(t, [0x15, 0x2a, 0x55, 0x2a, 0xaa], 2863311530);
    decodeAndRead(t, [0x01, 0x2a, 0x55, 0x2a, 0x55, 0x2a, 0x55, 0x2a, 0xa9], BigInt('48038396025285289'));

    throws(t, () => {
        VInt.decode(new Uint8Array([]));
    }, e => e instanceof SmileError)

    throws(t, () => {
        VInt.decode(new Uint8Array([0xaa, 0xab]));
    }, e => e instanceof SmileError)

    throws(t, () => {
        VInt.decode(new Uint8Array([0x31, 0x32]));
    }, e => e instanceof SmileError)

    t.end();
});

function decodeAndRead(t: Test, elements: number[], wanted: number | bigint): void {
    const encodedBytes = new Uint8Array(elements);
    t.equal(VInt.decode(encodedBytes), wanted);

    const inputStream = new InputStream(encodedBytes);
    t.equal(VInt.read(inputStream), wanted);
}
