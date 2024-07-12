import {BitView} from 'bit-buffer';
import {SmileError} from './error.js';
import {calcByteLen} from './utils.js';
import {InputStream} from './inputStream.js';
import {OutputStream} from './outputStream.js';
import {VInt} from './vInt.js';
import {BigInteger} from './bigInteger.js';

export class SafeBinary {
    public static decode(bytes: Uint8Array): Uint8Array {
        const decodedByteLen = calcByteLen(bytes.length, 7, 8);
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
        return SafeBinary.decode(bytes);
    }

    public static readBigInt(inputStream: InputStream): bigint {
        return BigInteger.decode(SafeBinary.read(inputStream));
    }

    public static encode(bytes: Uint8Array): Uint8Array {
        const encodedBytes: number[] = [];
        const bitView = new BitView(bytes.buffer);
        bitView.bigEndian = true;
        let bitOffset = 0;
        let remainingBits = bytes.length * 8;
        while (remainingBits > 0) {
            const bitsToRead = Math.min(remainingBits, 7);
            const n = bitView.getBits(bitOffset, bitsToRead);
            encodedBytes.push(n);
            bitOffset += bitsToRead;
            remainingBits -= bitsToRead;
        }
        return new Uint8Array(encodedBytes);
    }

    public static write(outputStream: OutputStream, bytes: Uint8Array): void {
        VInt.write(outputStream, bytes.length);
        outputStream.write(SafeBinary.encode(bytes));
    }

    public static writeBigInt(outputStream: OutputStream, value: bigint): void {
        SafeBinary.write(outputStream, BigInteger.encode(value));
    }
}
