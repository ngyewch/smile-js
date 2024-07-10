import {Test} from 'tap';
import {MessageExtra} from '@tapjs/core';
import testDiff from 'js-testdiff';

export function arrayEqual(t: Test, found: Uint8Array, wanted: Uint8Array, ...[msg, extra]: MessageExtra): boolean {
    if (found.length != wanted.length) {
        return t.fail({
            msg: msg,
            ...extra,
            wanted: wanted,
            found: found,
        });
    }
    for (let i = 0; i < found.length; i++) {
        if (found[i] != wanted[i]) {
            return t.fail({
                msg: msg,
                ...extra,
                wanted: wanted,
                found: found,
            });
        }
    }
    return t.pass({
        msg: msg,
        ...extra,
    });
}

export function approx(t: Test, found: number, wanted: number, epsilon: number, ...[msg, extra]: MessageExtra): boolean {
    const diff = Math.abs(found - wanted);
    if (diff <= epsilon) {
        return t.pass({
            msg: msg,
            ...extra,
        });
    } else {
        return t.fail({
            msg: msg,
            ...extra,
            wanted: wanted,
            found: found,
        });
    }
}

export function objectEqual(t: Test, found: any, wanted: any, ...[msg, extra]: MessageExtra): boolean {
    const diff = testDiff(found, wanted);
    if (!diff) {
        return t.pass({
            msg: msg,
            ...extra,
        });
    } else {
        return t.fail({
            msg: msg,
            ...extra,
            wanted: wanted,
            found: found,
        });
    }
}

export function throws(t: Test, fn: () => void, check: (e: any) => boolean, ...[msg, extra]: MessageExtra): boolean {
    try {
        fn();
        return t.fail({
            msg: msg,
            ...extra,
        });
    } catch (e) {
        if (check(e)) {
            return t.pass({
                msg: msg,
                ...extra,
            });
        } else {
            return t.fail({
                msg: msg,
                ...extra,
            });
        }
    }
}
