import { Parser } from "acorn";
import { tokTypes as tt, TokenType } from "acorn";

// Create a new token type for SLT keywords
const tt_slt_keyword = new TokenType("slt_keyword", {
  keyword: "slt_keyword"
});

// SLT node type
export interface SLTNode {
  type: "SLTExpression";
  keyword: string;
  value?: string;
  body?: SLTNode[];
  start: number;
  end: number;
}

export function sltPlugin(ParserClass: typeof Parser) {
  return class SLTParser extends ParserClass {
    // Override readWord to detect SLT keywords
    readWord() {
      const word = super.readWord();
      if (typeof this.value === "string" && this.value.startsWith("slt_")) {
        this.type = tt_slt_keyword;
      }
      return word;
    }

    // We hook parseStatement to intercept SLT constructs
    parseStatement(context: any, topLevel: boolean) {
      if (this.type === tt_slt_keyword) {
        return this.parseSLT();
      }
      return super.parseStatement(context, topLevel);
    }

    // Parse our custom SLT construct
    parseSLT(): SLTNode {
      const start = this.start;
      const keyword = this.value as string;

      this.next(); // consume keyword

      // Form: slt_print "hello";
      if (this.type !== tt.braceL && this.type !== tt.braceR) {
        let value = "";

        while (
          !this.eof() &&
          this.type !== tt.braceL &&
          this.type !== tt.semi &&
          this.type !== tt_slt_keyword
        ) {
          value += this.value + " ";
          this.next();
        }

        if (this.type === tt.semi) {
          this.next(); // consume semicolon
        }

        return {
          type: "SLTExpression",
          keyword,
          value: value.trim(),
          start,
          end: this.lastTokEnd
        };
      }

      // Form: slt_block { ... }
      if (this.type === tt.braceL) {
        this.next(); // consume {

        const body: SLTNode[] = [];

        while (this.type !== tt.braceR) {
          if (this.type === tt_slt_keyword) {
            body.push(this.parseSLT());
          } else {
            this.next();
          }
        }

        this.next(); // consume }

        return {
          type: "SLTExpression",
          keyword,
          body,
          start,
          end: this.lastTokEnd
        };
      }

      this.raise(start, `Unexpected SLT keyword structure: ${keyword}`);
    }
  };
}
