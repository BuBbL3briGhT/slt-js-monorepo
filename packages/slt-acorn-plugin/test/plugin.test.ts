import { SLTParser } from "slt-acorn-plugin";

const result = SLTParser.parse(`
  slt_print "hello world";
  slt_block {
    slt_debug "inside block";
  }
`);

console.log(JSON.stringify(result, null, 2));
