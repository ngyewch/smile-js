/**
 * Parse SMILE-encoded data.
 *
 * @param data SMILE-encoded data
 * @param options parser options
 */
export declare function parse(data: Uint8Array, options?: ParserOptions): any;

/**
 * Parser options.
 */
declare interface ParserOptions {
}

/**
 * SMILE error.
 */
export declare class SmileError extends Error {
    constructor(msg: string);
}

export { }
