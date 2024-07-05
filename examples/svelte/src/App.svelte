<script lang="ts">
    import {parse} from 'smile-js';

    let json: string = '';

    function onChooseFile(e: Event) {
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
                    const o = parse(data);
                    console.log(o);
                    json = JSON.stringify(o, null, 2);
                } catch (e) {
                    alert(e);
                }
            })
            .catch(e => {
                alert(e);
            });
    }
</script>

<div>
    <label for="file">Select SMILE-encoded file</label>
    <input id="file" type="file" on:change={onChooseFile}/>
</div>
<div>
    <label for="output">JSON representation:</label>
    <pre id="output">{json}</pre>
</div>
