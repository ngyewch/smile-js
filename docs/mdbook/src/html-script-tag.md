# HTML Script Tag

To use smile-js via the HTML script tag:

```html
<script src="https://cdn.jsdelivr.net/npm/smile-js@0.10.1/dist/smile-js.iife.js"></script>
```

The module will be exported as `windows.smile`.

## Example

<script type="module">
    import playgroundElements from 'https://cdn.jsdelivr.net/npm/playground-elements@0.18.1/+esm'
</script>

<style>
    playground-ide {
        --playground-code-font-family: Roboto Mono, monospace;
        --playground-preview-width: 50%;
    }
</style>

<playground-ide editable-file-system line-numbers resizable project-src="./projects/html/project.json"></playground-ide>
