import {OutputStream} from './outputStream.js';
import {SharedStringBuffer} from './sharedStringBuffer.js';
import {SmileError} from "./error";

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
        this.outputStream.write([0x32, 0x29, 0x0a]);
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
        // TODO
    }

    private writeNumber(n: number): void {
        // TODO
    }

    private writeBigInt(n: bigint): void {
        // TODO
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

    private writeKey(s: string): void {
        // TODO
    }
}
