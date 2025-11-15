import { GrammarMatch, SLTSemanticResult } from "./types";

export class SemanticResolver {
  resolve(match: GrammarMatch): SLTSemanticResult {
    return {
      intent: match.pattern.intent,
      args: match.args
    };
  }
}
