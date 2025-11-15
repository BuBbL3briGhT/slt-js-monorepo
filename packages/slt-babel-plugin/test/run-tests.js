const babel = require("@babel/core");
const pluginPath = require.resolve("../lib/index.js");
const esPack = require("../../@slt-lang/es/index.json");

const code = `// example with localized identifiers
let cuenta = 0;
function incrementar() { cuenta = cuenta + 1; }
`;

// Use plugin to replace localized identifiers to canonical if mapping exists
const map = {
  "cuenta": "count",
  "incrementar": "increment"
};

const res = babel.transformSync(code, {
  plugins: [[pluginPath, { map }]],
  filename: "test-file.js"
});

console.log("Transformed code:\\n", res.code);

// Example forward generation: turn "return" -> localized "vuelta"
const canonicalCode = "function f(){ return 42; }";
const forwardMap = { "vuelta": "return" }; // localized->canonical
const localized = require("../lib/index.js").generateLocalizedSource(canonicalCode, forwardMap);
console.log("Localized generation result:\\n", localized);
