import {SmileError} from './error.js';
import {normalizeNumber} from './utils.js';

export class ZigZag {
    public static decode(value: number | bigint): number | bigint {
        if (value < 0) {
            throw new SmileError("illegal zigzag value");
        }
        const v = BigInt(value);
        const isOdd = ((v % BigInt(2)) === BigInt(1));
        if (isOdd) {
            return normalizeNumber(-(v + BigInt(1)) / BigInt(2));
        } else {
            return normalizeNumber(v / BigInt(2));
        }
    }

    public static encode(value: number | bigint): number | bigint {
        const v = BigInt(value);
        const isNegative = (v < 0);
        if (isNegative) {
            return normalizeNumber((-v * BigInt(2)) - BigInt(1));
        } else {
            return normalizeNumber(v * BigInt(2));
        }
    }
}
