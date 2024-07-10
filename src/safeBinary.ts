import {BitView} from 'bit-buffer';
import {SmileError} from './error.js';
import {calcByteLen} from './utils.js';
import {InputStream} from './inputStream.js';
import {VInt} from './vInt.js';

export class SafeBinary {
    public static decode(bytes: Uint8Array, decodedByteLen: number): Uint8Array {
        const arrayBuffer = new ArrayBuffer(decodedByteLen);
        const bitView = new BitView(arrayBuffer);
        bitView.bigEndian = true;
        let bitOffset = 0;
        let remainingBits = decodedByteLen * 8;
        for (let i = 0; i < bytes.length; i++) {
            const b = bytes[i];
            const bitsToWrite = Math.min(remainingBits, 7);
            bitView.setBits(bitOffset, b, bitsToWrite);
            bitOffset += bitsToWrite;
            remainingBits -= bitsToWrite;
        }
        return new Uint8Array(arrayBuffer);
    }

    public static read(inputStream: InputStream): Uint8Array {
        const decodedByteLen = VInt.read(inputStream);
        if (typeof (decodedByteLen) === 'bigint') {
            throw new SmileError('invalid length');
        }
        const encodedByteLen = calcByteLen(decodedByteLen, 8, 7);
        const bytes = inputStream.readArray(encodedByteLen);
        return SafeBinary.decode(bytes, decodedByteLen);
    }

    public static readBigInt(inputStream: InputStream): bigint {
        const bytes = SafeBinary.read(inputStream);
        let n = BigInt(0);
        if (bytes.length === 0) {
            return n;
        }
        const isNegative = (bytes[0] & 0x80) === 0x80;
        for (let i = 0; i < bytes.length; i++) {
            n = (n * BigInt(256)) + BigInt(isNegative ? bytes[i] ^ 0xff : bytes[i]);
        }
        if (isNegative) {
            n = -n - BigInt(1);
        }
        return n;
    }
}
