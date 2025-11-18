// acorn-augment.d.ts
// Local augmentation declaring the Parser internals that our plugin uses.
// We intentionally use `any` for some internals because Acorn's internal shapes
// are not part of the public TS surface.

declare module "acorn" {
  // minimal shape for token types helper
  export const tokTypes: any;

  export interface Position {
    line: number;
    column: number;
  }

  export interface Parser {
    // runtime-visible parser internals used by our plugin:
    type: any;
    value: any;
    start: number;
    lastTokEnd: number;

    // methods
    readWord?: () => any;
    next?: () => any;
    expect?: (tok: any) => void;
    parseStatement?: (context?: any, topLevel?: boolean) => any;
    eof?: () => boolean;
    raise?: (pos: number, msg: string) => never;

    // helper flag we may set on `this`
    _isSLTToken?: boolean;
  }

  export class Parser {
    constructor(options?: any);
    parse: (input: string) => any;
  }
}
