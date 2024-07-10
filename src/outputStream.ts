export class OutputStream {
    private buffer: number[];

    constructor() {
        this.buffer = [];
    }

    public write(n: number | number[] | Uint8Array): void {
        if (Array.isArray(n) || (n instanceof Uint8Array)) {
            this.buffer = this.buffer.concat(Array.from(n));
        } else {
            this.buffer.push(n);
        }
    }

    public toUint8Array(): Uint8Array {
        return new Uint8Array(this.buffer);
    }
}
