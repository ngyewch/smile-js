import t from 'tap';
import {arrayEqual} from './utils/helper.js';
import {SafeBinary} from '../src/safeBinary.js';

t.test('should decode safe binary encoded bits', t => {
    const wanted = new Uint8Array([0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    const data = new Uint8Array([0x00, 0x3f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x03]);
    arrayEqual(t, SafeBinary.decode(data, wanted.length), wanted);

    t.end();
});
