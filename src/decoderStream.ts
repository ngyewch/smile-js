import {InputStream} from './inputStream.js';
import {Decoder} from './decoder.js';
import {SmileError} from './error.js';

export class DecoderStream {
    private readonly inputStream: InputStream;
    private readonly decoder: Decoder;

    constructor(inputStream: InputStream) {
        this.inputStream = inputStream;
        this.decoder = new Decoder();
    }

    public isEof(): boolean {
        return this.inputStream.isEof();
    }

    public read(): number {
        return this.inputStream.read();
    }

    public peek(): number {
        return this.inputStream.peek();
    }

    private readVIntBytes(): Uint8Array {
        const bytes: number[] = [];
        while (true) {
            const n = this.read();
            bytes.push(n);
            if ((n & 0x80) === 0x80) {
                break;
            }
        }
        return new Uint8Array(bytes);
    }

    public readUnsignedVint(): number | bigint {
        const bytes = this.readVIntBytes();
        return this.decoder.decodeVInt(bytes);
    }

    public readSignedVint(): number | bigint {
        return this.decoder.decodeZigZag(this.readUnsignedVint());
    }

    public readAscii(len: number): string {
        return this.decoder.decodeAscii(this.inputStream.readArray(len));
    }

    public readUtf8(len: number): string {
        return this.decoder.decodeUtf8(this.inputStream.readArray(len));
    }

    public readFloat32(): number {
        return this.decoder.decodeFloat32(this.readFixedLengthBigEndianEncodedBytes(4));
    }

    public readFloat64(): number {
        return this.decoder.decodeFloat64(this.readFixedLengthBigEndianEncodedBytes(8));
    }

    public readFixedLengthBigEndianEncodedBytes(decodedByteLen: number): Uint8Array {
        const encodedByteLen = Math.ceil(decodedByteLen * 8 / 7);
        const bytes = this.inputStream.readArray(encodedByteLen);
        return this.decoder.decodeFixedLengthBigEndianEncodedBytes(bytes, decodedByteLen);
    }

    public readSafeBinary(): Uint8Array {
        const decodedByteLen = this.readUnsignedVint();
        if (typeof (decodedByteLen) === 'bigint') {
            throw new SmileError('invalid length');
        }
        const encodedByteLen = Math.ceil(decodedByteLen * 8 / 7);
        const bytes = this.inputStream.readArray(encodedByteLen);
        return this.decoder.decodeSafeBinaryEncodedBits(bytes, decodedByteLen);
    }

    public readBigInt(): bigint {
        const bytes = this.readSafeBinary();
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

    public readBigDecimal(): number {
        const scale = this.readSignedVint();
        if (typeof (scale) === 'bigint') {
            throw new SmileError('invalid scale');
        }
        const magnitude = this.readBigInt();
        return Number(magnitude) * Math.pow(10, scale);
    }

    public readLongString(): Uint8Array {
        const buffer: number[] = [];
        while (true) {
            const c = this.inputStream.read();
            if (c === 0xfc) {
                break;
            }
            buffer.push(c);
        }
        return new Uint8Array(buffer);
    }

    public readLongAscii() {
        return this.decoder.decodeAscii(this.readLongString());
    }

    public readLongUtf8() {
        return this.decoder.decodeUtf8(this.readLongString());
    }

    public readBytes(len: number): Uint8Array {
        return this.inputStream.readArray(len);
    }
}
