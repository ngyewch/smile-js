import {InputStream} from './inputStream.js';
import {ZigZag} from './zigZag.js';
import {VInt} from './vInt.js';
import {ASCII} from './ascii.js';
import {UTF8} from './utf8.js';
import {FixedLengthBigEndian} from './fixedLengthBigEndian.js';
import {SafeBinary} from './safeBinary.js';
import {LongString} from './longString.js';
import {BigDecimal} from './bigDecimal.js';

export class DecoderStream {
    private readonly inputStream: InputStream;

    constructor(inputStream: InputStream) {
        this.inputStream = inputStream;
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

    public readASCII(encodedByteLen: number): string {
        return ASCII.read(this.inputStream, encodedByteLen);
    }

    public readUTF8(encodedByteLen: number): string {
        return UTF8.read(this.inputStream, encodedByteLen);
    }

    public readFloat32(): number {
        return FixedLengthBigEndian.readFloat32(this.inputStream);
    }

    public readFloat64(): number {
        return FixedLengthBigEndian.readFloat64(this.inputStream);
    }

    public readSafeBinary(): Uint8Array {
        return SafeBinary.read(this.inputStream);
    }

    public readBigInt(): bigint {
        return SafeBinary.readBigInt(this.inputStream);
    }

    public readBigDecimal(): number {
        return BigDecimal.read(this.inputStream);
    }

    public readLongASCII(): string {
        return LongString.readASCII(this.inputStream);
    }

    public readLongUTF8() {
        return LongString.readUTF8(this.inputStream);
    }

    public readBytes(len: number): Uint8Array {
        return this.inputStream.readArray(len);
    }
}
