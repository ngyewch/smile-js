import t from 'tap';
import {ASCII} from '../src/ascii.js';
import {InputStream} from '../src/inputStream.js';

t.test('should decode ASCII values', t => {
    const encodedBytes = new Uint8Array([0x61, 0x62, 0x63]);
    const wanted = 'abc';

    t.equal(ASCII.decode(encodedBytes), wanted);

    const inputStream = new InputStream(encodedBytes);
    t.equal(ASCII.read(inputStream, encodedBytes.length), wanted);

    t.end();
});
