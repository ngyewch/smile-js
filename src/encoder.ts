import {OutputStream} from './outputStream.js';
import {SharedStringBuffer} from './sharedStringBuffer.js';
import {SmileError} from './error.js';
import {FixedLengthBigEndian} from './fixedLengthBigEndian.js';
import {ZigZag} from './zigZag.js';
import {VInt} from './vInt.js';
import {SafeBinary} from './safeBinary.js';
import {ASCII} from './ascii.js';
import {UTF8} from './utf8.js';
import {LongString} from './longString.js';

/**
 * Encoder options.
 */
export interface EncoderOptions {
    sharedPropertyName: boolean;
    sharedStringValue: boolean;
    rawBinary: boolean;
}

const defaultEncoderOptions: EncoderOptions = {
    sharedPropertyName: true,
    sharedStringValue: false,
    rawBinary: false,
};

const version = 0;
const MAX_INT32 = 2147483647;
const MIN_INT32 = -2147483648;
const MAX_INT64 = BigInt('9223372036854775807');
const MIN_INT64 = BigInt('-9223372036854775808');

/**
 * SMILE-encode the specified value.
 *
 * @param value value
 * @param options encoder options
 */
export function encode(value: any, options?: Partial<EncoderOptions>): Uint8Array {
    return new EncoderContext(value, options).encode();
}

class EncoderContext {
    private readonly value: any;
    private readonly options: EncoderOptions;
    private readonly outputStream: OutputStream;
    private readonly sharedPropertyNames: SharedStringBuffer;
    private readonly sharedStringValues: SharedStringBuffer;

    constructor(value: any, options?: Partial<EncoderOptions>) {
        this.value = value;
        if (options !== undefined) {
            this.options = {
                ...defaultEncoderOptions,
                ...options,
            }
        } else {
            this.options = defaultEncoderOptions;
        }

        this.outputStream = new OutputStream();
        this.sharedPropertyNames = new SharedStringBuffer(this.options.sharedPropertyName, 1024);
        this.sharedStringValues = new SharedStringBuffer(this.options.sharedStringValue, 1024);
    }

    public encode(): Uint8Array {
        this.outputStream.write([0x3a, 0x29, 0x0a]);
        let options = version << 4;
        if (this.options.sharedPropertyName) {
            options |= 0x01;
        }
        if (this.options.sharedStringValue) {
            options |= 0x02;
        }
        if (this.options.rawBinary) {
            options |= 0x04;
        }
        this.outputStream.write(options);

        this.writeValue(this.value);

        return this.outputStream.toUint8Array();
    }

    private writeValue(value: any): void {
        if ((value === undefined) || (value === null)) {
            this.writeNull();
            return;
        } else if (value instanceof Uint8Array) {
            this.writeBinary(value as Uint8Array);
            return;
        } else if (Array.isArray(value)) {
            this.writeArray(value as any[]);
            return;
        } else {
            const type = typeof value;
            switch (type) {
                case 'undefined':
                    this.writeNull();
                    return;
                case 'boolean':
                    this.writeBoolean(value as boolean);
                    return;
                case 'string':
                    this.writeString(value as string);
                    return;
                case 'number':
                    this.writeNumber(value as number);
                    return;
                case 'bigint':
                    this.writeBigInt(value as bigint);
                    return;
                case 'object':
                    this.writeObject(value as { [key: string]: any });
                    return;
                default:
                    throw new SmileError('unsupported type: ' + type);
            }
        }
    }

    private writeNull(): void {
        this.outputStream.write(0x21);
    }

    private writeBoolean(b: boolean): void {
        if (b) {
            this.outputStream.write(0x23);
        } else {
            this.outputStream.write(0x22);
        }
    }

    private writeString(s: string): void {
        if (s === '') {
            this.outputStream.write(0x20);
            return;
        }
        const reference = this.sharedStringValues.getReference(s);
        if (reference >= 0) { // has reference
            if (reference < 31) {
                this.outputStream.write(0x00 | (reference + 1));
                return;
            } else {
                this.outputStream.write(0xec | ((reference >> 8) & 0x03));
                this.outputStream.write(reference & 0xff);
                return;
            }
        } else { // no reference
            this.sharedStringValues.addString(s);
            if (ASCII.isASCII(s)) {
                if (s.length <= 32) {
                    this.outputStream.write(0x40 | (s.length - 1));
                    ASCII.write(this.outputStream, s);
                    return;
                } else if (s.length <= 64) {
                    this.outputStream.write(0x60 | (s.length - 33));
                    ASCII.write(this.outputStream, s);
                    return;
                } else {
                    this.outputStream.write(0xe0);
                    LongString.writeASCII(this.outputStream, s);
                    return;
                }
            } else {
                const encodedBytes = UTF8.encode(s);
                if (encodedBytes.length <= 33) {
                    this.outputStream.write(0x80 | (encodedBytes.length - 2));
                    UTF8.write(this.outputStream, s);
                    return;
                } else if (encodedBytes.length <= 64) {
                    this.outputStream.write(0xa0 | (encodedBytes.length - 34));
                    UTF8.write(this.outputStream, s);
                    return;
                } else {
                    this.outputStream.write(0xe4);
                    LongString.writeUTF8(this.outputStream, s);
                    return;
                }
            }
        }
    }

    private writeNumber(n: number): void {
        if (Number.isSafeInteger(n)) { // safe integer
            if ((n >= -16) && (n <= 15)) { // small integer
                const zigZagEncodedValue = ZigZag.encode(n);
                if ((typeof zigZagEncodedValue === 'number') && (zigZagEncodedValue < 32)) {
                    this.outputStream.write(0xc0 | zigZagEncodedValue);
                } else {
                    throw new SmileError('unexpected error');
                }
            } else if ((n >= MIN_INT32) && (n <= MAX_INT32)) { // int32
                this.outputStream.write(0x24);
                VInt.write(this.outputStream, ZigZag.encode(n));
            } else if ((n >= Number.MIN_SAFE_INTEGER) && (n <= Number.MAX_SAFE_INTEGER)) { // int64
                this.outputStream.write(0x25);
                VInt.write(this.outputStream, ZigZag.encode(n));
            } else { // treat everything else as int64
                this.outputStream.write(0x25);
                VInt.write(this.outputStream, ZigZag.encode(n));
            }
        } else { // treat everything else as double
            this.outputStream.write(0x29);
            FixedLengthBigEndian.writeFloat64(this.outputStream, n);
        }
    }

    private writeBigInt(n: bigint): void {
        this.outputStream.write(0x26);
        SafeBinary.writeBigInt(this.outputStream, n);
    }

    private writeArray(array: any[]): void {
        this.outputStream.write(0xf8);
        for (let i = 0; i < array.length; i++) {
            this.writeValue(array[i]);
        }
        this.outputStream.write(0xf9);
    }

    private writeObject(o: { [key: string]: any }): void {
        this.outputStream.write(0xfa);
        for (const key in o) {
            const value = o[key];
            this.writeKey(key);
            this.writeValue(value);
        }
        this.outputStream.write(0xfb);
    }

    private writeBinary(data: Uint8Array): void {
        if (this.options.rawBinary) {
            this.outputStream.write(0xfd);
            VInt.write(this.outputStream, data.length);
            this.outputStream.write(data);
        } else {
            this.outputStream.write(0xe8);
            SafeBinary.write(this.outputStream, data);
        }
    }

    private writeKey(s: string): void {
        if (s === '') {
            this.outputStream.write(0x20);
            return;
        }
        const reference = this.sharedPropertyNames.getReference(s);
        if (reference >= 0) { // has reference
            if (reference < 64) {
                this.outputStream.write(0x40 | reference);
                return;
            } else {
                this.outputStream.write(0x30 | ((reference >> 8) & 0x03));
                this.outputStream.write(reference & 0xff);
                return;
            }
        } else { // no reference
            this.sharedPropertyNames.addString(s);
            if (ASCII.isASCII(s)) {
                if (s.length <= 64) {
                    this.outputStream.write(0x80 | (s.length - 1));
                    ASCII.write(this.outputStream, s);
                    return;
                } else {
                    this.outputStream.write(0x34);
                    LongString.writeUTF8(this.outputStream, s);
                    return;
                }
            } else {
                const encodedBytes = UTF8.encode(s);
                if (encodedBytes.length <= 56) {
                    this.outputStream.write(0xc0 | (encodedBytes.length - 2));
                    UTF8.write(this.outputStream, s);
                    return;
                } else {
                    this.outputStream.write(0x34);
                    LongString.writeUTF8(this.outputStream, s);
                    return;
                }
            }
        }
    }
}
