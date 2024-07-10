import {InputStream} from './inputStream.js';

export class UTF8 {
    public static decode(bytes: Uint8Array): string {
        return new TextDecoder('utf8').decode(bytes);
    }

    public static read(inputStream: InputStream, encodedByteLen: number): string {
        const encodedBytes = inputStream.readArray(encodedByteLen);
        return UTF8.decode(encodedBytes);
    }
}
