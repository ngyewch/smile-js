import t from 'tap';
import {SmileError} from '../../../main/js/error.js';

t.test('SmileError constructor test', t => {
    const e = new SmileError('my error message');
    t.equal(e.message, 'my error message');
    t.ok(e instanceof SmileError);
    t.end()
});
