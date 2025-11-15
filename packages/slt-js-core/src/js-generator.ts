import { SLTSemanticResult, SLTTranspileOutput } from "./types";

export class JSGenerator {
  generate(result: SLTSemanticResult): SLTTranspileOutput {
    switch (result.intent) {
      case "print":
        return {
          js: `console.log(${JSON.stringify(result.args.text)});`
        };

      case "set-variable":
        return {
          js: `let ${result.args.name} = ${JSON.stringify(result.args.value)};`
        };

      case "increment":
        return {
          js: `${result.args.name}++;`
        };

      case "conditional-if-eq":
        return {
          js: `if (${result.args.left} === ${result.args.right}) { ${result.args.js} }`
        };

      default:
        return {
          js: `// unknown intent: ${result.intent}`
        };
    }
  }
}
