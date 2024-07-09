import SMILE from 'smile-js'
import fs from 'fs'

var data = fs.readFileSync('basicObject.smile')
console.log(SMILE.parse(data))
