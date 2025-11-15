import { Parser } from "acorn";
import { sltAcornPlugin } from "../src/plugin.js";

const SLTParser = Parser.extend(sltAcornPlugin);

const ast = SLTParser.parse("print hola mundo");

console.log(JSON.stringify(ast, null, 2));
