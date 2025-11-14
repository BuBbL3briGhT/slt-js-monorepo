const assert=require('assert'); const fs=require('fs'); const path=require('path');
const core = require('../lib/index.js');
const ex = fs.readFileSync(path.join(__dirname,'..','examples','example-esp.js'),'utf8');
const out = core.transpileFileContent(ex);
assert(out.includes('function'),'expected function token');
console.log('core tests ok');