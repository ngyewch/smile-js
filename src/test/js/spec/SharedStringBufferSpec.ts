import t from 'tap';
import {SharedStringBuffer} from '../../../main/js/sharedStringBuffer.js';
import {SmileError} from "../../../main/js/index.js";

t.test('when not enabled', t => {
    const ssb = new SharedStringBuffer('test', false, false, 4);

    t.doesNotThrow(() => ssb.addString('test1'));

    try {
        ssb.getString(0);
        t.fail();
    } catch (e) {
        t.ok(e instanceof SmileError);
    }

    t.end()
});

t.test('when enabled', t => {
    const ssb = new SharedStringBuffer('test', false, true, 4);

    t.equal(ssb.addString('test1'), 1);
    t.equal(ssb.getString(1), 'test1');
    t.equal(ssb.addString('test2'), 2);
    t.equal(ssb.getString(2), 'test2');
    t.equal(ssb.addString('test3'), 3);
    t.equal(ssb.getString(3), 'test3');
    t.equal(ssb.addString('test4'), 4);
    t.equal(ssb.getString(4), 'test4');
    t.equal(ssb.addString('test5'), 1);
    t.equal(ssb.getString(1), 'test5');

    try {
        ssb.getString(3);
        t.fail();
    } catch (e) {
        t.ok(e instanceof SmileError);
    }

    t.end();
});
