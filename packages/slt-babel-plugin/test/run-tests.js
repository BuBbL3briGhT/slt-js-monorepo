const babel = require('@babel/core'); const plugin = require('../lib/index.js');
const fs=require('fs'); const path=require('path');
const map = { 'función':'function','vuelta':'return' };
const code = "function_test = 1; función f(){ vuelta 1; }";
const result = babel.transformSync(code, { plugins:[[plugin,{map:map}]] , filename: 'testfile.js'});
console.log('Babel plugin test complete (transform ran)');