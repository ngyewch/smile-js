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
    return Math.ceil(inputByteLen * inputBitsPerByte / outputBitsPerByte);
}
