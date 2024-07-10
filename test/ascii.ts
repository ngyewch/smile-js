import t from 'tap';
import {ASCII} from '../src/ascii.js';

t.test('should decode ASCII values', t => {
    t.equal(ASCII.decode(new Uint8Array([0x61, 0x62, 0x63])), 'abc');

    t.end();
});
