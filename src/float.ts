import {SmileError} from './error.js';

function toDataView(bytes: Uint8Array): DataView {
    const buffer = new ArrayBuffer(bytes.length);
    const view = new DataView(buffer);
    for (let i = 0; i < bytes.length; i++) {
        view.setUint8(i, bytes[i])
    }
    return view;
}

export class Float32 {
    public static decode(bytes: Uint8Array): number {
        if (bytes.length !== 4) {
            throw new SmileError('invalid float32');
        }
        return toDataView(bytes).getFloat32(0, false);
    }

    public static encode(n: number): Uint8Array {
        const buffer = new ArrayBuffer(4);
        const view = new DataView(buffer);
        view.setFloat32(0, n, false);
        return new Uint8Array(buffer);
    }
}

export class Float64 {
    public static decode(bytes: Uint8Array): number {
        if (bytes.length !== 8) {
            throw new SmileError('invalid float64');
        }
        return toDataView(bytes).getFloat64(0, false);
    }

    public static encode(n: number): Uint8Array {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        view.setFloat64(0, n, false);
        return new Uint8Array(buffer);
    }
}
