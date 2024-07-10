import {InputStream} from './inputStream.js';
import {OutputStream} from './outputStream.js';

const textDecoder = new TextDecoder('ascii');
const textEncoder = new TextEncoder(); // HACK 'utf8' is valid for 'ascii'

export class ASCII {
    public static decode(bytes: Uint8Array): string {
        return textDecoder.decode(bytes);
    }

    public static read(inputStream: InputStream, encodedByteLen: number): string {
        const encodedBytes = inputStream.readArray(encodedByteLen);
        return ASCII.decode(encodedBytes);
    }

    public static encode(s: string): Uint8Array {
        return textEncoder.encode(s);
    }

    public static write(outputStream: OutputStream, s: string): void {
        outputStream.write(ASCII.encode(s));
    }
}
