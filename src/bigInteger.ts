export class BigInteger {
    public static decode(bytes: Uint8Array): bigint {
        let n = BigInt(0);
        if (bytes.length === 0) {
            return n;
        }
        const isNegative = (bytes[0] & 0x80) === 0x80;
        for (let i = 0; i < bytes.length; i++) {
            n = (n * BigInt(256)) + BigInt(isNegative ? bytes[i] ^ 0xff : bytes[i]);
        }
        if (isNegative) {
            n = -n - BigInt(1);
        }
        return n;
    }

    public static encode(value: bigint): Uint8Array {
        const isNegative = (value < 0);
        let absValue = isNegative ? -value - BigInt(1) : value;
        const bytes: number[] = [];
        while (absValue > 0) {
            const quotient = absValue / BigInt(256);
            const remainder = Number(absValue % BigInt(256));
            bytes.push(isNegative ? (remainder ^ 0xff) : remainder);
            absValue = quotient;
        }
        if (isNegative) {
            const msb = bytes[bytes.length - 1];
            if ((msb & 0x80) !== 0x80) {
                bytes.push(0xff);
            }
        } else {
            const msb = bytes[bytes.length - 1];
            if ((msb & 0x80) !== 0x00) {
                bytes.push(0);
            }
        }
        bytes.reverse();
        return new Uint8Array(bytes);
    }
}