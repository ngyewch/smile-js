import t from 'tap';
import {Decoder} from '../src/decoder.js';
import {arrayEqual} from './utils/helper.js';

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
