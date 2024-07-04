import {InputStream} from './inputStream.js';
import {Decoder} from './decoder.js';

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

    public readUnsignedVint(): number {
        let value = 0;
        let bits = 0;

        function safeLeftShift(n: number, shift: number): void {
            const bitMask = [0x00, 0x01, 0x03, 0x07, 0x0f, 0x1f, 0x3f, 0x7f, 0xff];
            const shiftMultiplier = [1, 2, 4, 8, 16, 32, 64, 128];

            if ((bits + shift) < 32) {
                value <<= shift;
                value |= n & bitMask[shift];
            } else {
                value *= shiftMultiplier[shift];
                value += n & bitMask[shift];
            }
            bits += shift;
        }

        while (true) {
            const n = this.inputStream.read();
            if (n & 0x80) {
                safeLeftShift(n, 6);
                return value;
            } else {
                safeLeftShift(n, 7);
            }
        }
    }

    public readSignedVint(): number {
        return this.decoder.decodeZigZag(this.readUnsignedVint());
    }

    public readAscii(len: number): string {
        return this.decoder.decodeAscii(this.inputStream.readArray(len));
    }

    public readUtf8(len: number):string {
        return this.decoder.decodeUtf8(this.inputStream.readArray(len));
    }

    public readFloat32(): number {
        return this.decoder.decodeFloat32(this.readFixedLengthBigEndianEncodedBits(32));
    }

    public readFloat64(): number {
        return this.decoder.decodeFloat64(this.readFixedLengthBigEndianEncodedBits(64));
    }

    public readFixedLengthBigEndianEncodedBits(bits: number): Uint8Array {
        const bytes = this.inputStream.readArray(Math.ceil(bits / 7));
        return this.decoder.decodeFixedLengthBigEndianEncodedBits(bytes, bits);
    }

    public readSafeBinary(): Uint8Array {
        const len = this.readUnsignedVint();
        const bytes = this.inputStream.readArray(Math.ceil(len * 8 / 7));
        return this.decoder.decodeSafeBinaryEncodedBits(bytes, len * 8);
    }

    public readBigInt(): number {
        const bytes = this.readSafeBinary();
        let n = 0;
        for (let i = 0; i < bytes.length; i++) {
            n = (n * 256) + bytes[i];
        }
        return n;
    }

    public readBigDecimal(): number {
        const scale = this.readSignedVint();
        const magnitude = this.readBigInt();
        return magnitude * Math.pow(10, scale);
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
