import {BitView} from 'bit-buffer';
import {SmileError} from './error.js';
import {normalizeNumber} from './utils.js';

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
        return normalizeNumber(value);
    }

    public decodeZigZag(value: number | bigint): number | bigint {
        if (value < 0) {
            throw new SmileError("illegal zigzag value");
        }
        if (typeof value === 'bigint') {
            if (value <= BigInt(2147483647)) {
                if ((value % BigInt(2)) === BigInt(1)) {
                    return normalizeNumber(-(value >> BigInt(1)) - BigInt(1));
                } else {
                    return normalizeNumber(value >> BigInt(1));
                }
            } else {
                if ((value % BigInt(2)) === BigInt(1)) {
                    const v = (value - BigInt(1)) / BigInt(2);
                    return normalizeNumber(-v - BigInt(1));
                } else {
                    const v = value / BigInt(2);
                    return normalizeNumber(v);
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

    public decodeFixedLengthBigEndianEncodedBytes(bytes: Uint8Array, decodedByteLen: number): Uint8Array {
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

    public decodeSafeBinaryEncodedBits(bytes: Uint8Array, decodedByteLen: number): Uint8Array {
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
}
