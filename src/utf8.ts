import {InputStream} from './inputStream.js';
import {OutputStream} from './outputStream.js';

const textDecoder = new TextDecoder('utf8');
const textEncoder = new TextEncoder('utf8');

export class UTF8 {
    public static decode(bytes: Uint8Array): string {
        return textDecoder.decode(bytes);
    }

    public static read(inputStream: InputStream, encodedByteLen: number): string {
        const encodedBytes = inputStream.readArray(encodedByteLen);
        return UTF8.decode(encodedBytes);
    }

    public static encode(s: string): Uint8Array {
        return textEncoder.encode(s);
    }

    public static write(outputStream: OutputStream, s: string): void {
        outputStream.write(UTF8.encode(s));
    }
}
