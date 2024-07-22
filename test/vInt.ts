import t, {Test} from 'tap';
import {VInt} from '../src/vInt.js';
import {SmileError} from '../src/error.js';
import {InputStream} from '../src/inputStream.js';
import {OutputStream} from '../src/outputStream.js';
import {arrayEqual, throws} from './utils/assert.js';

t.test('should decode/encode VInt values', t => {
    doTest(t, [0x80], 0);
    doTest(t, [0x15, 0x2a, 0x55, 0x2a, 0xaa], 2863311530);
    doTest(t, [0x01, 0x2a, 0x55, 0x2a, 0x55, 0x2a, 0x55, 0x2a, 0xa9], BigInt('48038396025285289'));

    throws(t, () => {
        VInt.decode(new Uint8Array([]));
    }, e => e instanceof SmileError)

    throws(t, () => {
        VInt.decode(new Uint8Array([0xaa, 0xab]));
    }, e => e instanceof SmileError)

    throws(t, () => {
        VInt.decode(new Uint8Array([0x31, 0x32]));
    }, e => e instanceof SmileError)

    throws(t, () => {
        VInt.encode(-1);
    }, e => e instanceof SmileError)

    t.end();
});

function doTest(t: Test, elements: number[], wanted: number | bigint): void {
    const encodedBytes = new Uint8Array(elements);
    t.equal(VInt.decode(encodedBytes), wanted);

    const inputStream = new InputStream(encodedBytes);
    t.equal(VInt.read(inputStream), wanted);

    const outputStream = new OutputStream();
    VInt.write(outputStream, wanted);
    arrayEqual(t, outputStream.toUint8Array(), encodedBytes);
}
