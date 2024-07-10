import t from 'tap';
import {Decoder} from '../src/decoder.js';
import {approx, arrayEqual} from './utils/helper.js';

t.test('should decode ASCII values', t => {
    const decoder = new Decoder();

    t.equal(decoder.decodeAscii(new Uint8Array([0x61, 0x62, 0x63])), 'abc');

    t.end();
});

t.test('should decode UTF-8 values', t => {
    const decoder = new Decoder();

    t.equal(decoder.decodeUtf8(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe6, 0x82, 0xa8, 0xe5, 0xa5, 0xbd])), 'Hello 您好');

    t.end();
});

t.test('should decode 32-bit float values', t => {
    const decoder = new Decoder();

    const bigEndianBytes = [0x44, 0x9a, 0x52, 0x25];
    approx(t, decoder.decodeFloat32(new Uint8Array(bigEndianBytes)), 1234.567, 0.001);

    t.end();
});

t.test('should decode 64-bit float values', t => {
    const decoder = new Decoder();

    const bigEndianBytes = [0x41, 0x67, 0x8c, 0x29, 0xc3, 0xf3, 0x5b, 0xa7];
    approx(t, decoder.decodeFloat64(new Uint8Array(bigEndianBytes)), 12345678.123456789, 0.000000001);

    t.end();
});

t.test('should decode fixed-length big-endian encoded bits', t => {
    const decoder = new Decoder();

    {
        const wanted = new Uint8Array([0x44, 0x9a, 0x52, 0x25]);
        const data = new Uint8Array([0x04, 0x24, 0x69, 0x24, 0x25]);
        arrayEqual(t, decoder.decodeFixedLengthBigEndianEncodedBytes(data, 4), wanted);
    }

    {
        const wanted = new Uint8Array([0x41, 0x67, 0x8c, 0x29, 0xc3, 0xf3, 0x5b, 0xa7]);
        const data = new Uint8Array([0x00, 0x41, 0x33, 0x63, 0x05, 0x1c, 0x1f, 0x4d, 0x37, 0x27]);
        arrayEqual(t, decoder.decodeFixedLengthBigEndianEncodedBytes(data, 8), wanted);
    }

    t.end();
})

t.test('should decode safe binary encoded bits', t => {
    const decoder = new Decoder();

    const wanted = new Uint8Array([0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    const data = new Uint8Array([0x00, 0x3f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x03]);
    arrayEqual(t, decoder.decodeSafeBinaryEncodedBits(data, wanted.length), wanted);

    t.end();
});
