import {SmileError} from './error.js';

export const eofError = new SmileError('end of input stream reached');

export class InputStream {
    private readonly array: Uint8Array;
    private index: number = 0;

    constructor(array: Uint8Array) {
        this.array = array;
    }

    public isEof(): boolean {
        return (this.index >= this.array.length);
    }

    public read(): number {
        if (this.isEof()) {
            throw eofError;
        }
        const v = this.array[this.index];
        this.index++;
        return v;
    }

    public readArray(n: number): Uint8Array {
        if (n < 0) {
            throw new SmileError('invalid read amount');
        }
        if (n === 0) {
            return new Uint8Array([]);
        }
        if (this.isEof()) {
            throw eofError;
        }
        const endIndex = Math.min(this.array.length, this.index + n);
        const readData = this.array.subarray(this.index, endIndex);
        this.index = endIndex;
        return readData;
    }

    public peek(): number {
        if (this.isEof()) {
            throw eofError;
        }
        return this.array[this.index];
    }

    public skip(n: number) {
        if (this.isEof()) {
            throw eofError;
        }
        if (n < 0) {
            throw new SmileError('invalid skip amount');
        }
        this.index += n;
    }
}
