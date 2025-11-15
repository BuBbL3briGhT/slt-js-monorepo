export interface SLTAstBase {
  type: string;
  start: number;
  end: number;
}

export interface SLTPrintNode extends SLTAstBase {
  type: "SLTPrintStatement";
  argument: string;
}

export interface SLTReturnNode extends SLTAstBase {
  type: "SLTReturnStatement";
  argument: string;
}

export interface SLTIfEqNode extends SLTAstBase {
  type: "SLTIfEqStatement";
  left: string;
  right: string;
  body: any[];
}

export type SLTNode =
  | SLTPrintNode
  | SLTReturnNode
  | SLTIfEqNode;
