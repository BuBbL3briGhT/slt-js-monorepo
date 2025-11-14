#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const core = require('../slt-js-core/lib/index.js');
const argv = process.argv.slice(2);
if (argv.length===0){ console.log('Usage: slt-js <file> [-o out]'); process.exit(1); }
const infile = argv[0]; const out = argv[2]||null;
const src = fs.readFileSync(infile,'utf8');
const result = core.transpileFileContent(src, infile);
if (out) fs.writeFileSync(out,result,'utf8'); else process.stdout.write(result);
