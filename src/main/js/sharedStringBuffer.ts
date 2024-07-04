import {SmileError} from './error.js';

export class SharedStringBuffer {
    private readonly enabled: boolean;
    private readonly maxStrings: number;
    private strings: string[];

    constructor(enabled: boolean, maxStrings: number) {
        if (maxStrings > 1024) {
            throw new SmileError('maxStrings must be <= 1024');
        }
        this.enabled = enabled;
        this.maxStrings = maxStrings;
        this.strings = [];
    }

    public addString(s: string): number {
        if (!this.enabled) {
            return -1;
        }
        if (this.strings.length >= this.maxStrings) {
            this.strings = [];
        }
        const index = this.strings.length;
        this.strings.push(s);
        return index;
    };

    public getString(index: number): string {
        if (!this.enabled) {
            throw new SmileError('shared strings are not enabled.');
        }
        if (index >= this.strings.length) {
            throw new SmileError('shared string reference out of range.');
        }
        return this.strings[index];
    };
}
