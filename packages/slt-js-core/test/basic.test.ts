import { SLTTranspiler } from "../src/slt-transpiler.js";

const mockPack = {
  name: "English Test",
  iso: "en",
  patterns: [
    {
      match: /^print (.+)$/i,
      intent: "print",
      extract: (input, m) => ({ text: m[1] })
    }
  ]
};

const slt = new SLTTranspiler([mockPack]);

console.log("Test:", slt.transpile("print hello world", "en"));
