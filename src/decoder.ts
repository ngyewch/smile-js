import {BitView} from 'bit-buffer';
import {SmileError} from './error.js';
import {normalizeNumber} from './utils.js';

export class Decoder {
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
