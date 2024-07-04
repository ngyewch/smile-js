import t from 'tap';
import {DecoderStream} from '../../../main/js/decoderStream.js';
import {InputStream} from '../../../main/js/inputStream.js';
import {approx} from './utils.js';

t.test('should decode unsigned Vint values', t => {
    {
        const decoderStream = newDecoderStream([0x80]);
        t.equal(decoderStream.readUnsignedVint(), 0);
    }

    {
        const decoderStream = newDecoderStream([0x81]);
        t.equal(decoderStream.readUnsignedVint(), 1);
    }

    {
        const decoderStream = newDecoderStream([0x0f, 0x7f, 0x7f, 0x7f, 0xbf]);
        t.equal(decoderStream.readUnsignedVint(), 2147483647);
    }

    {
        const decoderStream = newDecoderStream([0x10, 0x00, 0x00, 0x00, 0x80]);
        t.equal(decoderStream.readUnsignedVint(), 2147483648);
    }

    t.end()
});

t.test('should decode 32-bit float values', t => {
    {
        const decoderStream = newDecoderStream([0x04, 0x24, 0x69, 0x24, 0x25]);
        approx(t, decoderStream.readFloat32(), 1234.567, 0.001);
    }

    t.end()
});

t.test('should decode 64-bit float values', t => {
    {
        const decoderStream = newDecoderStream([0x00, 0x41, 0x33, 0x63, 0x05, 0x1c, 0x1f, 0x4d, 0x37, 0x27]);
        approx(t, decoderStream.readFloat64(), 12345678.123456789, 0.000000001);
    }

    t.end()
});

function newDecoderStream(data: number[]): DecoderStream {
    return new DecoderStream(new InputStream(new Uint8Array(data)));
}

/*
  // TODO should decode signed Vint values
  // TODO should decode safe binary values
  // TODO should decode bigint values
  // TODO should decode bigdecimal values
  // TODO should decode long string values
  // TODO should decode long ASCII string values
  // TODO should decode long UTF-8 string values
  // TODO should decode raw binary values
*/
