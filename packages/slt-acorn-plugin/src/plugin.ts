import { TokenType, tokTypes } from "acorn";
import type * as acorn from "acorn";
import {
  SLTNode,
  SLTPrintNode,
  SLTReturnNode,
  SLTIfEqNode
} from "./types.js";

/**
 * Keywords we recognize (later replaced by language packs).
 */
const SLT_KEYWORDS = [
  "print",
  "imprime",
  "mostrar",
  "vuelta",
  "return",
  "si"
];

// Custom acorn token
const tt_slt_keyword = new TokenType("slt_keyword", {
  keyword: "slt_keyword"
});

export function sltAcornPlugin(Parser: typeof acorn.Parser) {
  return class SLTParser extends Parser {
    // Override tokenizer for SLT
    readWord() {
      const w = super.readWord();
      if (SLT_KEYWORDS.includes(this.input.slice(w.start, w.end))) {
        w.type = tt_slt_keyword;
      }
      return w;
    }

    // Entry interceptor
    parseStatement(context: string, topLevel: boolean) {
      const token = this.type;

      if (token === tt_slt_keyword) {
        return this.parseSLT();
      }

      return super.parseStatement(context, topLevel);
    }

    // Parse custom SLT nodes
    parseSLT(): SLTNode {
      const start = this.start;
      const keyword = this.value as string;

      this.next(); // consume keyword

      if (["print", "imprime", "mostrar"].includes(keyword)) {
        const arg = this.parseSLTStringArg();
        return {
          type: "SLTPrintStatement",
          start,
          end: this.lastTokEnd,
          argument: arg
        } as SLTPrintNode;
      }

      if (keyword === "vuelta") {
        const arg = this.parseSLTStringArg();
        return {
          type: "SLTReturnStatement",
          start,
          end: this.lastTokEnd,
          argument: arg
        } as SLTReturnNode;
      }

      if (keyword === "si") {
        const left = this.parseSLTStringArg();
        this.expect(tt_slt_keyword); // expect `es`
        const right = this.parseSLTStringArg();

        this.expect(tokTypes.braceL);

        const body: SLTNode[] = [];
        while (this.type !== tokTypes.braceR) {
          body.push(this.parseStatement("block", false) as SLTNode);
        }
        this.expect(tokTypes.braceR);

        return {
          type: "SLTIfEqStatement",
          start,
          end: this.lastTokEnd,
          left,
          right,
          body
        };
      }

      this.raise(start, `Unknown SLT keyword: ${keyword}`);
    }

    // A simple argument parser (reads until newline or brace)
    parseSLTStringArg(): string {
      let value = "";
      while (!this.eof() &&
             this.type !== tokTypes.braceL &&
             this.type !== tokTypes.semi &&
             this.type !== tt_slt_keyword) {
        value += this.value + " ";
        this.next();
      }
      return value.trim();
    }
  };
}
