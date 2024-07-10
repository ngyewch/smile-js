import t from 'tap';
import {VInt} from '../src/vInt.js';

t.test('should decode VInt values', t => {
    t.equal(VInt.decode(new Uint8Array([0x15, 0x2a, 0x55, 0x2a, 0xaa])), 2863311530);
    t.equal(VInt.decode(new Uint8Array([0x01, 0x2a, 0x55, 0x2a, 0x55, 0x2a, 0x55, 0x2a, 0xa9])), BigInt('48038396025285289'));

    t.end();
});
