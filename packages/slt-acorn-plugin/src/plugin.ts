import { Parser } from "acorn";
import * as acorn from "acorn";

// We reuse identifier token type since custom types are no longer supported
const tt_identifier = acorn.tokTypes.name;

// SLT AST node
export interface SLTNode {
  type: "SLTExpression";
  keyword: string;
  value?: string;
  body?: SLTNode[];
  start: number;
  end: number;
}

export function sltPlugin(BaseParser: typeof Parser) {
  return class SLTParser extends BaseParser {
    // Detect slt_* keywords inside identifier-like tokens
    readWord() {
      super.readWord();

      if (typeof this.value === "string" && this.value.startsWith("slt_")) {
        // We "pretend" it's a keyword by switching the token type
        // into identifier but marking special flag
        this.type = tt_identifier;
        (this as any)._isSLTToken = true;
      }

      return;
    }

    isSLTToken() {
      return (this as any)._isSLTToken === true;
    }

    // Override statement parsing
    parseStatement(context: any, topLevel: boolean) {
      if (this.isSLTToken()) {
        return this.parseSLT();
      }
      return super.parseStatement(context, topLevel);
    }

    parseSLT(): SLTNode {
      const start = this.start;
      const keyword = String(this.value);

      this.next(); // consume slt_* token
      (this as any)._isSLTToken = false;

      // Simple: slt_print "hello";
      if (this.type !== acorn.tokTypes.braceL) {
        let value = "";

        while (
          !this.eof() &&
          this.type !== acorn.tokTypes.braceL &&
          this.type !== acorn.tokTypes.semi &&
          !this.isSLTToken()
        ) {
          value += this.value + " ";
          this.next();
        }

        if (this.type === acorn.tokTypes.semi) {
          this.next();
        }

        return {
          type: "SLTExpression",
          keyword,
          value: value.trim(),
          start,
          end: this.lastTokEnd
        };
      }

      // Block: slt_block { ... }
      if (this.type === acorn.tokTypes.braceL) {
        this.next(); // {

        const body: SLTNode[] = [];

        while (this.type !== acorn.tokTypes.braceR) {
          if (this.isSLTToken()) {
            body.push(this.parseSLT());
          } else {
            this.next();
          }
        }

        this.next(); // }

        return {
          type: "SLTExpression",
          keyword,
          body,
          start,
          end: this.lastTokEnd
        };
      }

      this.raise(start, `Unexpected SLT keyword: ${keyword}`);
    }
  };
}
