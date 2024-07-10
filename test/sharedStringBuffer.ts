import t from 'tap';
import {SharedStringBuffer} from '../src/sharedStringBuffer.js';
import {SmileError} from '../src/error.js';
import {throws} from './utils/assert.js';

t.test('when not enabled', t => {
    const ssb = new SharedStringBuffer('test', false, 4);

    t.doesNotThrow(() => ssb.addString('test1'));

    throws(t, () => {
        ssb.getString(0);
    }, e => e instanceof SmileError);

    t.end()
});

t.test('when enabled', t => {
    const ssb = new SharedStringBuffer('test', true, 4);

    t.equal(ssb.addString('test1'), 0);
    t.equal(ssb.getString(0), 'test1');
    t.equal(ssb.addString('test2'), 1);
    t.equal(ssb.getString(1), 'test2');

    throws(t, () => {
        ssb.getString(2);
    }, e => e instanceof SmileError);

    t.equal(ssb.addString('test3'), 2);
    t.equal(ssb.getString(2), 'test3');
    t.equal(ssb.addString('test4'), 3);
    t.equal(ssb.getString(3), 'test4');
    t.equal(ssb.addString('test5'), 0);
    t.equal(ssb.getString(0), 'test5');

    throws(t, () => {
        ssb.getString(2);
    }, e => e instanceof SmileError);

    t.end();
});
