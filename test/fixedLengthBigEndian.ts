import t from 'tap';
import {approx, arrayEqual} from './utils/assert.js';
import {FixedLengthBigEndian} from '../src/fixedLengthBigEndian.js';
import {InputStream} from '../src/inputStream.js';

t.test('should decode fixed-length big-endian encoded bits', t => {
    {
        const decodedData = new Uint8Array([0x44, 0x9a, 0x52, 0x25]);
        const encodedData = new Uint8Array([0x04, 0x24, 0x69, 0x24, 0x25]);
        arrayEqual(t, FixedLengthBigEndian.decode(encodedData, 4), decodedData);
        arrayEqual(t, FixedLengthBigEndian.read(new InputStream(encodedData), 4), decodedData);
        approx(t, FixedLengthBigEndian.readFloat32(new InputStream(encodedData)), 1234.567, 0.001);
    }

    {
        const decodedData = new Uint8Array([0x41, 0x67, 0x8c, 0x29, 0xc3, 0xf3, 0x5b, 0xa7]);
        const encodedData = new Uint8Array([0x00, 0x41, 0x33, 0x63, 0x05, 0x1c, 0x1f, 0x4d, 0x37, 0x27]);
        arrayEqual(t, FixedLengthBigEndian.decode(encodedData, 8), decodedData);
        arrayEqual(t, FixedLengthBigEndian.read(new InputStream(encodedData), 8), decodedData);
        approx(t, FixedLengthBigEndian.readFloat64(new InputStream(encodedData)), 12345678.123456789, 0.000000001);
    }

    t.end();
})
