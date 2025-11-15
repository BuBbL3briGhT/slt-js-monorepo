import { LanguageLoader } from "./language-loader";
import { GrammarEngine } from "./grammar-engine";
import { SemanticResolver } from "./semantic-resolver";
import { JSGenerator } from "./js-generator";
import { SLTTranspileOutput } from "./types";

export class SLTTranspiler {
  private langLoader = new LanguageLoader();
  private grammar = new GrammarEngine();
  private semantics = new SemanticResolver();
  private generator = new JSGenerator();

  constructor(packs: any[] = []) {
    packs.forEach(p => this.langLoader.register(p));
  }

  transpile(input: string, lang: string): SLTTranspileOutput {
    const pack = this.langLoader.get(lang);
    if (!pack) {
      return { js: `// Unknown language: ${lang}` };
    }

    const match = this.grammar.match(input, pack);
    if (!match) {
      return { js: `// No SLT rule matched input` };
    }

    const semantic = this.semantics.resolve(match);
    return this.generator.generate(semantic);
  }
}
