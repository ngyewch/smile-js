import {InputStream} from './inputStream.js';
import {Decoder} from './decoder.js';
import {SmileError} from './error.js';
import {ZigZag} from './zigZag.js';
import {VInt} from './vInt.js';
import {ASCII} from './ascii.js';
import {UTF8} from './utf8.js';

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

    public readUnsignedVint(): number | bigint {
        return VInt.read(this.inputStream);
    }

    public readSignedVint(): number | bigint {
        return ZigZag.decode(this.readUnsignedVint());
    }

    public readAscii(encodedByteLen: number): string {
        return ASCII.read(this.inputStream, encodedByteLen);
    }

    public readUtf8(encodedByteLen: number): string {
        return UTF8.read(this.inputStream, encodedByteLen);
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
        return ASCII.decode(this.readLongString());
    }

    public readLongUtf8() {
        return UTF8.decode(this.readLongString());
    }

    public readBytes(len: number): Uint8Array {
        return this.inputStream.readArray(len);
    }
}
