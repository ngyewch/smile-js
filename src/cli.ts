import fs from 'fs';
import {program} from 'commander';
import {parse, stringify} from 'lossless-json';
import {version} from '../package.json';
import {decode} from './decoder.js';
import {encode, type EncoderOptions} from './encoder.js';
import {jsonParseNumber} from './utils.js';

program
    .name('smile-cli')
    .description('SMILE CLI')
    .version(version);

program.command('encode')
    .description('Encode JSON to SMILE')
    .argument('[jsonFile]', 'input JSON file')
    .argument('[smileFile]', 'output SMILE file')
    .option('--shared-string-value', 'shared string values', false)
    .option('--shared-property-name', 'shared property names', true)
    .option('--raw-binary', 'raw binary', false)
    .action(doEncode);

program.command('decode')
    .description('Decode SMILE to JSON')
    .argument('[smileFile]', 'input SMILE file')
    .argument('[jsonFile]', 'output JSON file')
    .option('--indent', 'indent', false)
    .action(doDecode);

program.parse();

function doEncode(inputJsonFile: string | undefined, outputSmileFile: string | undefined, options: EncoderOptions): void {
    const jsonValue = parse(readData(inputJsonFile).toString(), null, jsonParseNumber);
    const smileValue = encode(jsonValue, options);
    writeData(outputSmileFile, smileValue);
}

interface DecodeOptions {
    indent: boolean;
}

function doDecode(inputSmileFile: string | undefined, outputJsonFile: string | undefined, options: DecodeOptions): void {
    const smileValue = decode(readData(inputSmileFile));
    const jsonValue = stringify(smileValue, null, options.indent ? '  ' : undefined);
    if (jsonValue === undefined) {
        throw new Error('could not stringify');
    }
    writeData(outputJsonFile, jsonValue);
}

function readData(path: string | undefined): Uint8Array {
    return fs.readFileSync((path !== undefined) ? path : process.stdin.fd);
}

function writeData(path: string | undefined, data: Uint8Array | string): void {
    fs.writeFileSync((path !== undefined) ? path : process.stdout.fd, data);
    if (path === undefined) {
        console.log();
    }
}
