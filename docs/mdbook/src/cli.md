# Command-line tools

## smile-cli

```sh
smile-cli                            # installed globally
node_modules/smile-js/bin/smile-cli  # [npm] installed locally
pnpm exec smile-cli                  # [pnpm] installed locally
```

```
Usage: smile-cli [options] [command]

SMILE CLI

Options:
  -V, --version                            output the version number
  -h, --help                               display help for command

Commands:
  encode [options] [jsonFile] [smileFile]  Encode JSON to SMILE
  decode [options] [smileFile] [jsonFile]  Decode SMILE to JSON
  help [command]                           display help for command
```
