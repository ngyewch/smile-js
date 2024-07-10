import t from 'tap';
import {OutputStream} from '../src/outputStream.js';
import {arrayEqual} from './utils/assert.js';

t.test('OutputStream', t => {
    const outputStream = new OutputStream();

    outputStream.write([0x61, 0x62, 0x63]);
    arrayEqual(t, outputStream.toUint8Array(), new Uint8Array([0x61, 0x62, 0x63]));

    outputStream.write(0x20);
    arrayEqual(t, outputStream.toUint8Array(), new Uint8Array([0x61, 0x62, 0x63, 0x20]));

    outputStream.write([0x41, 0x42, 0x43]);
    arrayEqual(t, outputStream.toUint8Array(), new Uint8Array([0x61, 0x62, 0x63, 0x20, 0x41, 0x42, 0x43]));

    t.end();
});