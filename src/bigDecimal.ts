import {InputStream} from './inputStream.js';
import {SmileError} from './error.js';
import {ZigZag} from './zigZag.js';
import {VInt} from './vInt.js';
import {SafeBinary} from './safeBinary.js';

export class BigDecimal {
    public static read(inputStream: InputStream): number {
        const scale = ZigZag.decode(VInt.read(inputStream));
        if (typeof scale === 'bigint') {
            throw new SmileError('invalid scale');
        }
        const magnitude = SafeBinary.readBigInt(inputStream);
        return Number(magnitude) * Math.pow(10, -scale);
    }

    // TODO encode/write
}
