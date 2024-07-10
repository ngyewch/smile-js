import {InputStream} from './inputStream.js';
import {ASCII} from './ascii.js';
import {UTF8} from './utf8.js';

export class LongString {
    public static read(inputStream: InputStream): Uint8Array {
        const buffer: number[] = [];
        while (true) {
            const c = inputStream.read();
            if (c === 0xfc) {
                break;
            }
            buffer.push(c);
        }
        return new Uint8Array(buffer);
    }

    public static readASCII(inputStream: InputStream): string {
        return ASCII.decode(LongString.read(inputStream));
    }

    public static readUTF8(inputStream: InputStream): string {
        return UTF8.decode(LongString.read(inputStream));
    }
}
