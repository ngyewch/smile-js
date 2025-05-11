import * as smile from 'smile-js';

function onChooseFile(e) {
    const file = e.target.files.item(0)
    file.arrayBuffer()
        .then(arrayBuffer => {
            const data = new Uint8Array(arrayBuffer);
            try {
                const o = smile.decode(data);
                console.log(o);
                document.getElementById("output").innerText = JSON.stringify(o, null, 2);
            } catch (e) {
                alert(e);
            }
        })
        .catch(e => {
            alert(e);
        });
}

document.getElementById("file").addEventListener("change", onChooseFile);
