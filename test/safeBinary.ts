import t from 'tap';
import {arrayEqual, throws} from './utils/assert.js';
import {SafeBinary} from '../src/safeBinary.js';
import {InputStream} from '../src/inputStream.js';
import {OutputStream} from '../src/outputStream.js';
import {SmileError} from '../src/error.js';

t.test('should decode/encode safe binary encoded bits', t => {
    {
        const decodedData = new Uint8Array([0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
        const encodedData = new Uint8Array([0x00, 0x3f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x03]);
        arrayEqual(t, SafeBinary.decode(encodedData), decodedData);
        arrayEqual(t, SafeBinary.encode(decodedData), encodedData);
    }

    {
        const encodedData = new Uint8Array([0x80]);
        t.equal(SafeBinary.readBigInt(new InputStream(encodedData)), BigInt(0));
    }

    {
        const value = BigInt("-1329227995784915872903807060280344576");
        const encodedData = new Uint8Array([0x90, 0x7f, 0x040, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        t.equal(SafeBinary.readBigInt(new InputStream(encodedData)), value);

        const outputStream = new OutputStream();
        SafeBinary.writeBigInt(outputStream, value)
        arrayEqual(t, outputStream.toUint8Array(), encodedData);
    }

    {
        const value = BigInt("1329227995784915872903807060280344576");
        const encodedData = new Uint8Array([0x90, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        t.equal(SafeBinary.readBigInt(new InputStream(encodedData)), value);

        const outputStream = new OutputStream();
        SafeBinary.writeBigInt(outputStream, value)
        arrayEqual(t, outputStream.toUint8Array(), encodedData);
    }

    {
        const encodedData = new Uint8Array([0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0xff]);
        throws(t, () => {
            SafeBinary.read(new InputStream(encodedData));
        }, e => e instanceof SmileError);
    }

    t.end();
});
