import {BitView} from 'bit-buffer';
import {InputStream} from './inputStream.js';
import {calcByteLen} from './utils.js';
import {Float32, Float64} from './float.js';

export class FixedLengthBigEndian {
    public static decode(bytes: Uint8Array, decodedByteLen: number): Uint8Array {
        const arrayBuffer = new ArrayBuffer(decodedByteLen);
        const bitView = new BitView(arrayBuffer);
        bitView.bigEndian = true;
        let bitOffset = 0;
        let remainingBits = decodedByteLen * 8;
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            const bitsToWrite = Math.min(remainingBits, i === 0 ? 7 - ((bytes.length * 7) - (decodedByteLen * 8)) : 7);
            bitView.setBits(bitOffset, b, bitsToWrite);
            bitOffset += bitsToWrite;
            remainingBits -= bitsToWrite;
        }
        return new Uint8Array(arrayBuffer);
    }

    public static read(inputStream: InputStream, decodedByteLen: number): Uint8Array {
        const encodedByteLen = calcByteLen(decodedByteLen, 8, 7);
        const encodedBytes = inputStream.readArray(encodedByteLen);
        return FixedLengthBigEndian.decode(encodedBytes, decodedByteLen);
    }

    public static readFloat32(inputStream: InputStream): number {
        return Float32.decode(FixedLengthBigEndian.read(inputStream, 4));
    }

    public static readFloat64(inputStream: InputStream): number {
        return Float64.decode(FixedLengthBigEndian.read(inputStream, 8));
    }

    // TODO encode/write
}
