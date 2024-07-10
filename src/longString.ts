import {InputStream} from './inputStream.js';
import {OutputStream} from './outputStream.js';
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

    public static write(outputStream: OutputStream, bytes: Uint8Array): void {
        outputStream.write(bytes);
        outputStream.write(0xfc);
    }

    public static writeASCII(outputStream: OutputStream, s: string): void {
        LongString.write(outputStream, ASCII.encode(s));
    }

    public static writeUTF8(outputStream: OutputStream, s: string): void {
        LongString.write(outputStream, UTF8.encode(s));
    }
}
