<script lang="ts">
    import {decode, encode} from 'smile-js';
    import {isInteger, parse, stringify} from 'lossless-json';
    import {Base64} from 'js-base64';

    let decodedJson: string = '';
    let inputJson: string = '';

    function onChooseEncodedFile(e: Event) {
        const target = e.target as HTMLInputElement;
        if (!target.files || (target.files.length < 1)) {
            return;
        }
        const file = target.files.item(0)
        if (!file) {
            return;
        }
        file.arrayBuffer()
            .then(arrayBuffer => {
                const data = new Uint8Array(arrayBuffer);
                try {
                    const o = decode(data);
                    console.log(o);
                    const json = stringify(o, null, '  ');
                    if (json !== undefined) {
                        decodedJson = json;
                    } else {
                        alert('could not JSON stringify object')
                    }
                } catch (e) {
                    alert(e);
                }
            })
            .catch(e => {
                alert(e);
            });
    }

    function onClickEncode(e: Event) {
        try {
            const o = parse(inputJson, null, parseNumber);
            console.log('input', o);
            const encodedData = encode(o);
            download('encoded.smile', 'application/x-jackson-smile', encodedData);
        } catch (e) {
            alert(e);
        }
    }

    function download(filename: string, contentType: string, data: Uint8Array) {
        const element = document.createElement('a');
        element.setAttribute('href', `data:${contentType};base64,${Base64.fromUint8Array(data)}`);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    function parseNumber(v: string): unknown {
        if (isInteger(v)) {
            const b = BigInt(v);
            if ((b >= BigInt(Number.MIN_SAFE_INTEGER)) && (b <= BigInt(Number.MAX_SAFE_INTEGER))) {
                return Number(b);
            } else {
                return b;
            }
        } else {
            return parseFloat(v);
        }
    }
</script>

<h1>smile-js demo</h1>

<h2>Decode</h2>

<div>
    <label for="file">Select SMILE-encoded file</label>
    <input id="file" type="file" on:change={onChooseEncodedFile}/>
</div>
<div>
    <label for="output">JSON representation:</label>
    <pre id="output">{decodedJson}</pre>
</div>

<hr>

<h2>Encode</h2>

<button on:click={onClickEncode}>Encode</button>
<textarea class="inputJson" bind:value={inputJson}></textarea>

<style>
    .inputJson {
        width: 100%;
        height: 20em;
    }
</style>