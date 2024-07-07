import {SmileError} from './error.js';
import {BitView} from 'bit-buffer';

const bitMask = [0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff];

export class Decoder {
    public decodeVInt(bytes: Uint8Array): number | bigint {
        if (bytes.length <= 0) {
            throw new SmileError('invalid VInt');
        }
        let value = BigInt(0);
        for (let i = 0; i < bytes.length; i++) {
            const n = bytes[i];
            if (i < (bytes.length - 1)) {
                if ((n & 0x80) !== 0x00) {
                    throw new SmileError('invalid VInt');
                }
                value = (value * BigInt(128)) + BigInt(n & 0x7f);
            } else {
                if ((n & 0x80) !== 0x80) {
                    throw new SmileError('invalid VInt');
                }
                value = (value * BigInt(64)) + BigInt(n & 0x3f);
                break;
            }
        }
        if ((value >= BigInt(Number.MIN_SAFE_INTEGER)) && (value <= BigInt(Number.MAX_SAFE_INTEGER))) {
            return Number(value);
        } else {
            return value;
        }
    }

    public decodeZigZag(value: number | bigint): number | bigint {
        if (value < 0) {
            throw new SmileError("illegal zigzag value");
        }
        if (typeof value === 'bigint') {
            if (value <= BigInt(2147483647)) {
                if ((value % BigInt(2)) === BigInt(1)) {
                    return Number(-(value >> BigInt(1)) - BigInt(1));
                } else {
                    return Number(value >> BigInt(1));
                }
            } else {
                if ((value % BigInt(2)) === BigInt(1)) {
                    const v = (value - BigInt(1)) / BigInt(2);
                    return Number(-v - BigInt(1));
                } else {
                    const v = value / BigInt(2);
                    return Number(v);
                }
            }
        } else {
            if (value <= 2147483647) {
                if ((value % 2) === 1) {
                    return -(value >> 1) - 1;
                } else {
                    return (value >> 1);
                }
            } else {
                if ((value % 2) === 1) {
                    return -((value - 1) / 2) - 1;
                } else {
                    return value / 2;
                }
            }
        }
    }

    public decodeAscii(bytes: Uint8Array): string {
        return new TextDecoder('ascii').decode(bytes);
    }

    public decodeUtf8(bytes: Uint8Array): string {
        return new TextDecoder('utf8').decode(bytes);
    }

    private toDataView(bytes: Uint8Array): DataView {
        const buffer = new ArrayBuffer(bytes.length);
        const view = new DataView(buffer);
        for (let i = 0; i < bytes.length; i++) {
            view.setUint8(i, bytes[i])
        }
        return view;
    }

    // big-endian encoding
    public decodeFloat32(bytes: Uint8Array): number {
        return this.toDataView(bytes).getFloat32(0, false);
    }

    // big-endian encoding
    public decodeFloat64(bytes: Uint8Array): number {
        return this.toDataView(bytes).getFloat64(0, false);
    }

    public decodeFixedLengthBigEndianEncodedBits(bytes: Uint8Array, bits: number): Uint8Array {
        const output = new Uint8Array(Math.ceil(bits / 8));
        let iByte = 0;
        let iBitsRemaining = bits % 7;
        let oByte = 0;
        let oBitsWritten = 0;
        let currentInput = bytes[iByte];
        let currentOutput = 0;
        let oIndex;
        while (iByte < bytes.length) {
            const bitsToWrite = Math.min(iBitsRemaining, (8 - oBitsWritten));
            currentOutput <<= bitsToWrite;
            currentOutput |= currentInput >> (iBitsRemaining - bitsToWrite);
            iBitsRemaining -= bitsToWrite;
            currentInput &= bitMask[iBitsRemaining];
            oBitsWritten += bitsToWrite;
            if (iBitsRemaining === 0) {
                iByte++;
                iBitsRemaining = 7;
                currentInput = bytes[iByte];
            }
            if (oBitsWritten === 8) {
                oIndex = oByte;
                output[oIndex] = currentOutput;
                oByte++;
                oBitsWritten = 0;
                currentOutput = 0;
            }
        }
        if (oBitsWritten > 0) {
            currentOutput <<= (8 - oBitsWritten);
            oIndex = oByte;
            output[oIndex] = currentOutput;
        }
        return output;
    }

    public decodeSafeBinaryEncodedBits(bytes: Uint8Array, decodedByteLen: number): Uint8Array {
        if (decodedByteLen === 0) {
            return new Uint8Array(0);
        }
        const arrayBuffer = new ArrayBuffer(decodedByteLen);
        const bitView = new BitView(arrayBuffer);
        bitView.bigEndian = true;
        let bitOffset = 0;
        let remainingBits = decodedByteLen * 8;
        for (let i = 0; i < bytes.length - 1; i++) {
            let b = bytes[i];
            bitView.setBits(bitOffset, b, 7);
            bitOffset += 7;
            remainingBits -= 7;
        }
        if (remainingBits > 0) {
            const b = bytes[bytes.length - 1];
            bitView.setBits(bitOffset, b, remainingBits);
        }
        return new Uint8Array(arrayBuffer);
    }
}
