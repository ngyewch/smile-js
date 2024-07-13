import {isInteger} from 'lossless-json';

export function normalizeNumber(value: number | bigint): number | bigint {
    if (typeof value === 'bigint') {
        if ((value >= BigInt(Number.MIN_SAFE_INTEGER)) && (value <= BigInt(Number.MAX_SAFE_INTEGER))) {
            return Number(value);
        } else {
            return value;
        }
    } else {
        return value;
    }
}

export function calcByteLen(inputByteLen: number, inputBitsPerByte: number, outputBitsPerByte: number): number {
    if (inputBitsPerByte > outputBitsPerByte) {
        return Math.ceil(inputByteLen * inputBitsPerByte / outputBitsPerByte);
    } else {
        return Math.floor(inputByteLen * inputBitsPerByte / outputBitsPerByte);
    }
}

export function jsonParseNumber(v: string): unknown {
    if (isInteger(v)) {
        const b = BigInt(v);
        if ((b >= BigInt(Number.MIN_SAFE_INTEGER)) && (b <= BigInt(Number.MAX_SAFE_INTEGER))) {
            return Number(b);
        } else {
            return b;
        }
    } else {
        return parseFloat(v);
    }
}
