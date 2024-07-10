import {SmileError} from './error.js';
import {normalizeNumber} from './utils.js';
import {InputStream} from './inputStream.js';

export class VInt {
    public static decode(bytes: Uint8Array): number | bigint {
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

    public static read(inputStream: InputStream): number | bigint {
        const data: number[] = [];
        while (true) {
            const b = inputStream.read();
            data.push(b);
            if ((b & 0x80) === 0x80) {
                break;
            }
        }
        return VInt.decode(new Uint8Array(data));
    }
}
