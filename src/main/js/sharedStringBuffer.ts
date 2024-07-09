import {SmileError} from './error.js';

export class SharedStringBuffer {
    private readonly name: string;
    private readonly enabled: boolean;
    private readonly maxStrings: number;
    private strings: string[];
    private stringMap: { [key: string]: number };

    constructor(name: string, enabled: boolean, maxStrings: number) {
        this.name = name;
        this.enabled = enabled;
        this.maxStrings = maxStrings;
        this.strings = [];
        this.stringMap = {};
        this.reset();
    }

    private reset(): void {
        //console.log(`[${this.name}] ssb: reset`);
        this.strings = [];
        this.stringMap = {};
    }

    public static newValues(enabled: boolean): SharedStringBuffer {
        return new SharedStringBuffer('values', enabled, 1024);
    }

    public static newKeyNames(enabled: boolean): SharedStringBuffer {
        return new SharedStringBuffer('keyNames', enabled, 1024);
    }

    public addString(s: string): number {
        if (!this.enabled) {
            return -1;
        }
        const bytes = new TextEncoder().encode(s);
        if (bytes.length > 64) {
            return -1;
        }
        if (s in this.stringMap) {
            return this.stringMap[s];
        }
        if (this.strings.length >= this.maxStrings) {
            this.reset();
        }
        const index = this.strings.length;
        //console.log(`[${this.name}] ssb: add [${index}] '${s}'`);
        this.strings.push(s);
        this.stringMap[s] = index;
        return index;
    };

    public getString(index: number): string {
        //console.log(`[${this.name}] ssb: get [${index}] '${this.strings[index]}'`);
        if (!this.enabled) {
            throw new SmileError('shared strings are not enabled');
        }
        if (index >= this.strings.length) {
            throw new SmileError(`shared string reference out of range`);
        }
        return this.strings[index];
    };
}
