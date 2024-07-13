import {SmileError} from './error.js';

export class SharedStringBuffer {
    private readonly enabled: boolean;
    private readonly maxStrings: number;
    private strings: string[];
    private stringMap: { [key: string]: number };

    constructor(enabled: boolean, maxStrings: number) {
        this.enabled = enabled;
        this.maxStrings = maxStrings;
        this.strings = [];
        this.stringMap = {};
        this.reset();
    }

    private reset(): void {
        this.strings = [];
        this.stringMap = {};
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
        this.strings.push(s);
        this.stringMap[s] = index;
        return index;
    };

    public getReference(s: string): number {
        return ((this.enabled) && (s in this.stringMap)) ? this.stringMap[s] : -1;
    }

    public getString(index: number): string {
        if (!this.enabled) {
            throw new SmileError('shared strings are not enabled');
        }
        if (index >= this.strings.length) {
            throw new SmileError(`shared string reference out of range`);
        }
        return this.strings[index];
    };
}
