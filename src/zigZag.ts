import {SmileError} from './error.js';
import {normalizeNumber} from './utils.js';

export class ZigZag {
    public static decode(value: number | bigint): number | bigint {
        if (value < 0) {
            throw new SmileError("illegal zigzag value");
        }
        if (typeof value === 'bigint') {
            if (value <= BigInt(2147483647)) {
                if ((value % BigInt(2)) === BigInt(1)) {
                    return normalizeNumber(-(value >> BigInt(1)) - BigInt(1));
                } else {
                    return normalizeNumber(value >> BigInt(1));
                }
            } else {
                if ((value % BigInt(2)) === BigInt(1)) {
                    const v = (value - BigInt(1)) / BigInt(2);
                    return normalizeNumber(-v - BigInt(1));
                } else {
                    const v = value / BigInt(2);
                    return normalizeNumber(v);
                }
            }
        } else {
            if (value <= 2147483647) {
                if ((value % 2) === 1) {
                    return -(value >> 1) - 1;
                } else {
                    return (value >> 1);
                }
            } else {
                if ((value % 2) === 1) {
                    return -((value - 1) / 2) - 1;
                } else {
                    return value / 2;
                }
            }
        }
    }
}
