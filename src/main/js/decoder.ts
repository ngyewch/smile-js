import {SmileError} from './error.js';

const bitMask = [0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff];

export class Decoder {
    public decodeZigZag(value: number): number {
        if (value < 0) {
            throw new SmileError("illegal zigzag value");
        }
        if (value <= 2147483647) {
            if (value & 1) {
                return -(value >> 1) - 1;
            } else {
                return (value >> 1);
            }
        } else {
            if (value & 1) {
                return -(Math.floor(value / 2)) - 1;
            } else {
                return Math.floor(value / 2);
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

    public decodeSafeBinaryEncodedBits(bytes: Uint8Array, bits: number): Uint8Array {
        const output = new Uint8Array(Math.ceil(bits / 8));
        let iByte = 0;
        let iBitsRemaining = 7;
        let oByte = 0;
        let oBitsWritten = 0;
        let currentInput = bytes[iByte];
        let currentOutput = 0;
        while (oByte < output.length) {
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
                output[oByte] = currentOutput;
                oByte++;
                oBitsWritten = 0;
                currentOutput = 0;
            }
        }
        if (oBitsWritten > 0) {
            currentOutput <<= (8 - oBitsWritten);
            output[oByte] = currentOutput;
        }
        return output;
    }
}
