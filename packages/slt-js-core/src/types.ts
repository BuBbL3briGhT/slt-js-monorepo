export interface SLTLanguagePack {
  name: string;
  iso: string; // e.g., "en", "es", "fr"
  patterns: Array<SLTPattern>;
}

export interface SLTPattern {
  match: RegExp | ((input: string) => boolean);
  intent: string; // semantic action id
  extract?: (input: string, match: RegExpMatchArray) => any;
}

export interface SLTSemanticResult {
  intent: string;
  args: any;
}

export interface SLTTranspileOutput {
  js: string;
  ast?: any; // future: ESTree AST from Acorn plugin
}

export interface GrammarMatch {
  pattern: SLTPattern;
  args: any;
}
