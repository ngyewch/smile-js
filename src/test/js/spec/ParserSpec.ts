import t from 'tap';
import {parse} from '../../../main/js/parser.js';
import {testData} from '../testData.js';
import {objectEqual} from './utils.js';

function parseSmile(name: string): any {
    return parse(toUint8Array(testData[name]));
}

function parseJson(name: string): any {
    return JSON.parse(testData[name]);
}

function toUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

t.test('should parse correctly', t => {
    objectEqual(t, parseSmile('basicArray.sml'), parseJson('basicArray.min.json'));

    objectEqual(t, parseSmile('basicObject.sml'), parseJson('basicObject.min.json'));

    objectEqual(t, parseSmile('basicSimpleLiteralValues.sml'), parseJson('basicSimpleLiteralValues.min.json'));

    objectEqual(t, parseSmile('basicLongStrings.sml'), parseJson('basicLongStrings.min.json'));

    objectEqual(t, parseSmile('complexStructures.sml'), parseJson('complexStructures.min.json'));

    t.end();
});
