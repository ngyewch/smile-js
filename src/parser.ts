import {DecoderStream} from './decoderStream.js';
import {InputStream} from './inputStream.js';
import {SmileError} from './error.js';
import {SharedStringBuffer} from './sharedStringBuffer.js';
import {ZigZag} from './zigZag.js';

/**
 * Parser options.
 */
export interface ParserOptions {
}

/**
 * Parse SMILE-encoded data.
 *
 * @param data SMILE-encoded data
 * @param options parser options
 */
export function parse(data: Uint8Array, options?: ParserOptions): any {
    return new ParserContext(data, options).parse();
}

class ParserContext {
    private readonly decoderStream: DecoderStream;
    private readonly options?: ParserOptions;
    private sharedPropertyName: boolean;
    private sharedStringValue: boolean;
    private rawBinary: boolean;
    private version: number;
    private sharedPropertyNames: SharedStringBuffer;
    private sharedStringValues: SharedStringBuffer;

    constructor(data: Uint8Array, options?: ParserOptions) {
        this.decoderStream = new DecoderStream(new InputStream(data));
        this.options = options;

        this.sharedPropertyName = false;
        this.sharedStringValue = false;
        this.rawBinary = false;
        this.version = 0;

        // TODO
        this.sharedPropertyNames = new SharedStringBuffer(false, 1024);
        this.sharedStringValues = new SharedStringBuffer(false, 1024);
    }

    public parse(): any {
        // parse header
        const b0 = this.decoderStream.read();
        const b1 = this.decoderStream.read();
        const b2 = this.decoderStream.read();

        if ((b0 !== 0x3a) || (b1 !== 0x29) || (b2 !== 0x0a)) {
            throw new SmileError('invalid Smile header');
        }

        const b3 = this.decoderStream.read();
        this.sharedPropertyName = (b3 & 0x01) === 0x01;
        this.sharedStringValue = (b3 & 0x02) === 0x02;
        this.rawBinary = (b3 & 0x04) === 0x04;
        this.version = b3 >> 4;

        this.sharedPropertyNames = new SharedStringBuffer(this.sharedPropertyName, 1024);
        this.sharedStringValues = new SharedStringBuffer(this.sharedStringValue, 1024);

        return this.readValue();
    };

    private readValue(): any {
        const token = this.decoderStream.read();
        const tokenClass = token >> 5;
        const tokenValue = token & 0x1f;
        switch (tokenClass) {
            case 0: { // Short Shared Value String reference (single byte)
                return this.sharedStringValues.getString(tokenValue - 1);
            }
            case 1: { // Simple literals, numbers
                return this.readSimpleLiteralValue(token);
            }
            case 2: { // Tiny ASCII (1 - 32 bytes == chars)
                const value = this.decoderStream.readASCII(tokenValue + 1);
                this.sharedStringValues.addString(value);
                return value;
            }
            case 3: { // Short ASCII (33 - 64 bytes == chars)
                const value = this.decoderStream.readASCII(tokenValue + 33);
                this.sharedStringValues.addString(value);
                return value;
            }
            case 4: { // Tiny Unicode (2 - 33 bytes; <= 33 characters)
                const value = this.decoderStream.readUTF8(tokenValue + 2);
                this.sharedStringValues.addString(value);
                return value;
            }
            case 5: { // Short Unicode (34 - 64 bytes; <= 64 characters)
                const value = this.decoderStream.readUTF8(tokenValue + 34);
                this.sharedStringValues.addString(value);
                return value;
            }
            case 6: { // Small integers (single byte)
                return ZigZag.decode(tokenValue);
            }
            case 7: { // Binary / Long text / structure markers
                return this.readBinaryLongTextStructureValues(token);
            }
            default: {
                throw new SmileError(`unknown token class: ${tokenClass}`);
            }
        }
    }

    private readSimpleLiteralValue(token: number): any {
        if (token === 0x20) { // empty string
            return '';
        } else if (token === 0x21) { // null
            return null;
        } else if (token === 0x22) { // false
            return false;
        } else if (token === 0x23) { // true
            return true;
        } else if (token === 0x24) { // 32-bit integer; zigzag encoded, 1 - 5 data bytes
            return this.decoderStream.readSignedVint();
        } else if (token === 0x25) { // 64-bit integer; zigzag encoded, 5 - 10 data bytes
            return this.decoderStream.readSignedVint();
        } else if (token === 0x26) { // BigInteger
            return this.decoderStream.readBigInt();
        } else if (token === 0x28) { // 32-bit float
            return this.decoderStream.readFloat32();
        } else if (token === 0x29) { // 64-bit double
            return this.decoderStream.readFloat64();
        } else if (token === 0x2a) { // BigDecimal
            return this.decoderStream.readBigDecimal();
        } else {
            throw new SmileError('invalid value token 0x' + token.toString(16));
        }
    }

    private readBinaryLongTextStructureValues(token: number): any {
        if (token === 0xe0) { // Long (variable length) ASCII text
            return this.decoderStream.readLongASCII();
        } else if (token === 0xe4) { // Long (variable length) Unicode text
            return this.decoderStream.readLongUTF8();
        } else if (token === 0xe8) { // Binary, 7-bit encoded
            return this.decoderStream.readSafeBinary();
        } else if ((token >= 0xec) && (token <= 0xef)) { // Shared String reference, long
            const reference = ((token & 0x03) << 8) | this.decoderStream.read();
            return this.sharedStringValues.getString(reference);
        } else if (token === 0xf8) { // START_ARRAY
            const array: any[] = [];
            while (this.decoderStream.peek() !== 0xf9) { // END_ARRAY
                array.push(this.readValue());
            }
            this.decoderStream.read(); // consume END_ARRAY
            return array;
        } else if (token === 0xfa) { // START_OBJECT
            const object: { [key: string]: any } = {};
            while (this.decoderStream.peek() !== 0xfb) { // END_OBJECT
                const key = this.readKey();
                const value = this.readValue();
                object[key] = value;
            }
            this.decoderStream.read(); // consume END_OBJECT
            return object;
        } else if (token === 0xfd) { // Binary (raw)
            const len = this.decoderStream.readUnsignedVint();
            if (typeof(len) === 'bigint') {
                throw new SmileError('invalid length');
            }
            return this.decoderStream.readBytes(len);
        } else {
            throw new SmileError('invalid value token 0x' + token.toString(16));
        }
    }

    private readKey(): string {
        const token = this.decoderStream.read();
        if (token === 0x20) { // Special constant name '' (empty String)
            return '';
        } else if ((token >= 0x30) && (token <= 0x33)) { // 'Long' shared key name reference (2 byte token)
            const reference = ((token & 0x03) << 8) | this.decoderStream.read();
            return this.sharedPropertyNames.getString(reference);
        } else if (token === 0x34) { // Long (not-yet-shared) Unicode name
            return this.decoderStream.readLongUTF8();
        } else if ((token >= 0x40) && (token <= 0x7f)) { // 'Short' shared key name reference
            const reference = token & 0x3f;
            return this.sharedPropertyNames.getString(reference);
        } else if ((token >= 0x80) && (token <= 0xbf)) { // Short Ascii names
            const s = this.decoderStream.readASCII((token & 0x3f) + 1);
            this.sharedPropertyNames.addString(s);
            return s;
        } else if ((token >= 0xc0) && (token <= 0xf7)) { // Short Unicode names
            const s = this.decoderStream.readUTF8((token & 0x3f) + 2);
            this.sharedPropertyNames.addString(s);
            return s;
        } else {
            throw new SmileError('invalid key token 0x' + token.toString(16));
        }
    }
}
