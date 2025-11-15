import { SLTLanguagePack, GrammarMatch } from "./types";

export class GrammarEngine {
  match(input: string, pack: SLTLanguagePack): GrammarMatch | null {
    input = input.trim();

    for (const pattern of pack.patterns) {
      if (pattern.match instanceof RegExp) {
        const match = input.match(pattern.match);
        if (match) {
          return {
            pattern,
            args: pattern.extract ? pattern.extract(input, match) : {}
          };
        }
      } else if (typeof pattern.match === "function") {
        if (pattern.match(input)) {
          return {
            pattern,
            args: pattern.extract ? pattern.extract(input, [] as any) : {}
          };
        }
      }
    }

    return null;
  }
}
