import t from 'tap';
import {arrayEqual} from './utils/assert.js';
import {LongString} from '../src/longString.js';
import {InputStream} from '../src/inputStream.js';
import {OutputStream} from '../src/outputStream.js';

t.test('should decode/encode long string values', t => {
    {
        const stringValue = 'abc';
        const data = [0x61, 0x62, 0x63];
        let streamData: number[] = [];
        streamData = streamData.concat(data);
        streamData.push(0xfc);

        arrayEqual(t, LongString.read(new InputStream(new Uint8Array(streamData))), new Uint8Array(data));

        t.equal(LongString.readASCII(new InputStream(new Uint8Array(streamData))), stringValue);

        const outputStream = new OutputStream();
        LongString.writeASCII(outputStream, stringValue);
        arrayEqual(t, outputStream.toUint8Array(), new Uint8Array(streamData));
    }

    {
        const stringValue = 'Hello 您好';
        const data = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0xe6, 0x82, 0xa8, 0xe5, 0xa5, 0xbd];
        let streamData: number[] = [];
        streamData = streamData.concat(data);
        streamData.push(0xfc);

        arrayEqual(t, LongString.read(new InputStream(new Uint8Array(streamData))), new Uint8Array(data));

        t.equal(LongString.readUTF8(new InputStream(new Uint8Array(streamData))), stringValue);

        const outputStream = new OutputStream();
        LongString.writeUTF8(outputStream, stringValue);
        arrayEqual(t, outputStream.toUint8Array(), new Uint8Array(streamData));
    }

    t.end();
});