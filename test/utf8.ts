import t from 'tap';
import {UTF8} from '../src/utf8.js';
import {InputStream} from '../src/inputStream.js';

t.test('should decode UTF-8 values', t => {
    const encodedBytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe6, 0x82, 0xa8, 0xe5, 0xa5, 0xbd]);
    const wanted = 'Hello 您好';

    t.equal(UTF8.decode(encodedBytes), wanted);

    const inputStream = new InputStream(encodedBytes);
    t.equal(UTF8.read(inputStream, encodedBytes.length), wanted);

    t.end();
});
