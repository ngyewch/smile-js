import {InputStream} from './inputStream.js';

export class ASCII {
    public static decode(bytes: Uint8Array): string {
        return new TextDecoder('ascii').decode(bytes);
    }

    public static read(inputStream: InputStream, encodedByteLen: number): string {
        const encodedBytes = inputStream.readArray(encodedByteLen);
        return ASCII.decode(encodedBytes);
    }
}
