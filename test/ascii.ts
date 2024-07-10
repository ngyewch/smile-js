import t from 'tap';
import {ASCII} from '../src/ascii.js';
import {InputStream} from '../src/inputStream.js';
import {OutputStream} from '../src/outputStream.js';
import {arrayEqual} from './utils/assert.js';

t.test('should decode/encode ASCII values', t => {
    const encodedBytes = new Uint8Array([0x61, 0x62, 0x63]);
    const stringValue = 'abc';

    t.equal(ASCII.decode(encodedBytes), stringValue);
    arrayEqual(t, ASCII.encode(stringValue), encodedBytes);

    const inputStream = new InputStream(encodedBytes);
    t.equal(ASCII.read(inputStream, encodedBytes.length), stringValue);

    const outputStream = new OutputStream();
    ASCII.write(outputStream, stringValue);
    arrayEqual(t, outputStream.toUint8Array(), encodedBytes);

    t.end();
});
