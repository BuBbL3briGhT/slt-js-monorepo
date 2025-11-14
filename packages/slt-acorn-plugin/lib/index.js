// Reference Acorn plugin that demonstrates how keyword maps could be applied.
// This is illustrative: real integration would hook into Acorn's tokenizer and extend reserved words.
module.exports = function(acorn, opts){
  return {
    name: "slt-acorn-plugin",
    getMap: function(){ return opts && opts.map || {}; }
  };
};