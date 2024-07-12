import t from 'tap';
import {approx, arrayEqual} from './utils/assert.js';
import {FixedLengthBigEndian} from '../src/fixedLengthBigEndian.js';
import {InputStream} from '../src/inputStream.js';
import {OutputStream} from '../src/outputStream.js';

t.test('should decode/encode fixed-length big-endian encoded bits', t => {
    {
        const value = 1234.567;
        const epsilon = 0.001;
        const byteLength = 4;
        const floatEncodedData = new Uint8Array([0x44, 0x9a, 0x52, 0x25]);
        const fixedLengthBigEndianEncodedData = new Uint8Array([0x04, 0x24, 0x69, 0x24, 0x25]);
        arrayEqual(t, FixedLengthBigEndian.decode(fixedLengthBigEndianEncodedData), floatEncodedData);
        arrayEqual(t, FixedLengthBigEndian.read(new InputStream(fixedLengthBigEndianEncodedData), byteLength), floatEncodedData);
        approx(t, FixedLengthBigEndian.readFloat32(new InputStream(fixedLengthBigEndianEncodedData)), value, epsilon);

        const outputStream = new OutputStream();
        FixedLengthBigEndian.writeFloat32(outputStream, value);
        arrayEqual(t, outputStream.toUint8Array(), fixedLengthBigEndianEncodedData);
    }

    {
        const value = 12345678.123456789;
        const epsilon = 0.000000001;
        const byteLength = 8;
        const floatEncodedData = new Uint8Array([0x41, 0x67, 0x8c, 0x29, 0xc3, 0xf3, 0x5b, 0xa7]);
        const fixedLengthBigEndianEncodedData = new Uint8Array([0x00, 0x41, 0x33, 0x63, 0x05, 0x1c, 0x1f, 0x4d, 0x37, 0x27]);
        arrayEqual(t, FixedLengthBigEndian.decode(fixedLengthBigEndianEncodedData), floatEncodedData);
        arrayEqual(t, FixedLengthBigEndian.read(new InputStream(fixedLengthBigEndianEncodedData), byteLength), floatEncodedData);
        approx(t, FixedLengthBigEndian.readFloat64(new InputStream(fixedLengthBigEndianEncodedData)), value, epsilon);

        const outputStream = new OutputStream();
        FixedLengthBigEndian.writeFloat64(outputStream, value);
        arrayEqual(t, outputStream.toUint8Array(), fixedLengthBigEndianEncodedData);
    }

    t.end();
})
