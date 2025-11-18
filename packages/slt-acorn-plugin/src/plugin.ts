import { Parser } from "acorn";
import * as acorn from "acorn";

// Note: this file implements an Acorn-v8 friendly plugin class factory.
// It avoids calling `Parser.extend` (which the types may not advertise)
// and instead produces a subclass using the provided BaseParser.
//
// The implementation uses `any` in a few places to bridge runtime internals
// that are not fully expressed in the public d.ts from acorn.

// SLT AST node (simple)
export interface SLTNode {
  type: "SLTExpression";
  keyword: string;
  value?: string;
  body?: SLTNode[];
  start: number;
  end: number;
}

export function sltPlugin(BaseParser: typeof Parser) {
  // capture prototypal references for safe calls
  const baseProto: any = (BaseParser as any).prototype;

  return class SLTParser extends (BaseParser as any) {
    // Use property arrow members so TypeScript doesn't complain about
    // re-declaring the member as a function when the base defines it as a property.
    readWord = () => {
      // call base implementation if present
      if (typeof baseProto.readWord === "function") {
        baseProto.readWord.call(this);
      }

      // mark slt_* identifiers
      if (typeof (this as any).value === "string" && (this as any).value.startsWith("slt_")) {
        (this as any).type = acorn.tokTypes.name;
        (this as any)._isSLTToken = true;
      }
      return;
    };

    isSLTToken = (): boolean => {
      return (this as any)._isSLTToken === true;
    };

    // Match base signature: both parameters optional
    parseStatement = (context?: any, topLevel?: boolean): any => {
      if (this.isSLTToken()) {
        return (this as any).parseSLT();
      }
      // call base parseStatement with same args
      if (typeof baseProto.parseStatement === "function") {
        return baseProto.parseStatement.call(this, context, topLevel);
      }
      // fallback: delegate to super if available
      return (BaseParser as any).prototype.parseStatement.call(this, context, topLevel);
    };

    // parseSLT implemented as an arrow property to match member shape
    parseSLT = (): any => {
      const self: any = this;
      const start = self.start;
      const keyword = String(self.value);

      // consume token
      if (typeof self.next === "function") self.next();
      self._isSLTToken = false;

      // Non-block form: slt_x arg...;
      if (self.type !== acorn.tokTypes.braceL) {
        let value = "";
        while (
          !self.eof?.() &&
          self.type !== acorn.tokTypes.braceL &&
          self.type !== acorn.tokTypes.semi &&
          !self._isSLTToken
        ) {
          value += self.value + " ";
          if (typeof self.next === "function") self.next();
          else break;
        }

        if (self.type === acorn.tokTypes.semi && typeof self.next === "function") {
          self.next();
        }

        return {
          type: "SLTExpression",
          keyword,
          value: value.trim(),
          start,
          end: self.lastTokEnd
        } as SLTNode;
      }

      // Block form: slt_block { ... }
      if (self.type === acorn.tokTypes.braceL) {
        if (typeof self.next === "function") self.next(); // consume '{'

        const body: SLTNode[] = [];
        while (self.type !== acorn.tokTypes.braceR) {
          if (self._isSLTToken) {
            const child = (this as any).parseSLT();
            if (child) body.push(child);
            continue;
          }
          if (typeof self.next === "function") self.next();
          else break;
        }

        if (self.type === acorn.tokTypes.braceR && typeof self.next === "function") self.next();

        return {
          type: "SLTExpression",
          keyword,
          body,
          start,
          end: self.lastTokEnd
        } as SLTNode;
      }

      // Fallback: raise if available, otherwise throw
      if (typeof self.raise === "function") {
        self.raise(start, `Unexpected SLT keyword: ${keyword}`);
      }
      throw new Error(`Unexpected SLT keyword: ${keyword}`);
    };
  };
}
