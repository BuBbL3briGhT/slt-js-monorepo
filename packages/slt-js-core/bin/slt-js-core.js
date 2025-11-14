#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const core = require('../lib/index.js');

async function main(argv) {
  const args = argv.slice(2);
  if (args.length===0) { console.log('Usage: slt-js-core <file> [-o out]'); process.exit(1); }
  const input = args[0];
  let out = null;
  for (let i=1;i<args.length;i++){
    if (args[i]==='-o') { out = args[++i]; }
  }
  const src = fs.readFileSync(input,'utf8');
  const result = core.transpileFileContent(src, input);
  if (out) fs.writeFileSync(out, result, 'utf8');
  else process.stdout.write(result);
}

main(process.argv).catch(e=>{ console.error(e); process.exit(2); });
