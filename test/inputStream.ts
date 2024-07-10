import t from 'tap';
import {InputStream, eofError} from '../src/inputStream.js';
import {SmileError} from '../src/error.js';
import {arrayEqual, throws} from './utils/assert.js';

const data = [0x61, 0x62, 0x63];
const dataView = new Uint8Array(data);

t.test('should be able to read single elements of data', t => {
    const istrm = new InputStream(dataView);

    t.notOk(istrm.isEof())

    t.equal(istrm.read(), 0x61);
    t.notOk(istrm.isEof())

    t.equal(istrm.read(), 0x62);
    t.notOk(istrm.isEof())

    t.equal(istrm.read(), 0x63);
    t.ok(istrm.isEof())

    t.throws(() => istrm.read(), eofError);

    t.end();
});

t.test('should be able to peek at the data', t => {
    const istrm = new InputStream(dataView);

    t.equal(istrm.peek(), 0x61);
    t.notOk(istrm.isEof())
    t.equal(istrm.read(), 0x61);
    t.notOk(istrm.isEof())

    t.equal(istrm.peek(), 0x62);
    t.notOk(istrm.isEof())
    t.equal(istrm.read(), 0x62);
    t.notOk(istrm.isEof())

    t.equal(istrm.peek(), 0x63);
    t.notOk(istrm.isEof())
    t.equal(istrm.read(), 0x63);
    t.ok(istrm.isEof())

    t.throws(() => istrm.peek(), eofError);

    t.end();
});

t.test('should be able to read an array of data', t => {
    const istrm = new InputStream(dataView);

    const readData1 = istrm.readArray(2);
    t.notOk(istrm.isEof())
    t.equal(readData1.length, 2);
    arrayEqual(t, readData1, new Uint8Array([0x61, 0x62]));

    const readData2 = istrm.readArray(10);
    t.ok(istrm.isEof())
    t.equal(readData2.length, 1);
    arrayEqual(t, readData2, new Uint8Array([0x63]));

    t.throws(() => istrm.readArray(10), eofError);
    t.ok(istrm.isEof())

    arrayEqual(t, istrm.readArray(0), new Uint8Array([]));

    t.end();
});

t.test('should not be able to read negative amounts of data', t => {
    const istrm = new InputStream(dataView);

    throws(t, () => {
        istrm.readArray(-1);
    }, e => e instanceof SmileError);

    t.end();
});

t.test('should be able to skip data', t => {
    const istrm = new InputStream(dataView);

    istrm.skip(2);
    t.notOk(istrm.isEof());

    t.equal(istrm.read(), 0x63);
    t.ok(istrm.isEof());

    t.end();
});

t.test('should be able to skip past the end of data', t => {
    const istrm = new InputStream(dataView);

    istrm.skip(10);
    t.ok(istrm.isEof());

    t.throws(() => istrm.skip(10), eofError);
    t.ok(istrm.isEof())

    t.end();
});

t.test('should not be able to skip negative amounts of data', t => {
    const istrm = new InputStream(dataView);

    throws(t, () => {
        istrm.skip(-1);
    }, e => e instanceof SmileError);

    t.end();
});
