// slt-babel-plugin (reference)
// - Replaces Identifier names that exactly match localized keywords with canonical names.
// - If input AST contains custom SLT node types (e.g. SLTPrintStatement), transforms them to JS AST.
// - Exposes generateLocalizedSource(astSource, map) helper.

const { default: generate } = require("@babel/generator");
const t = require("@babel/types");

/**
 * Simple utility: detect if a token string looks like a string literal
 * (wraps in quotes) or a numeric literal; otherwise treat as identifier.
 */
function parseArgToNode(argStr) {
  if (typeof argStr !== "string") return t.identifier(String(argStr));
  const trimmed = argStr.trim();
  // string literal heuristic: starts and ends with " or '
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return t.stringLiteral(trimmed.slice(1, -1));
  }
  // number?
  if (!Number.isNaN(Number(trimmed))) {
    return t.numericLiteral(Number(trimmed));
  }
  // otherwise identifier
  return t.identifier(trimmed);
}

/**
 * Transform an SLT AST node into a Babel AST node.
 * This expects nodes produced by an SLT-capable parser (like their Acorn plugin).
 */
function transformSLTNode(node, state) {
  // node.type could be SLTPrintStatement, SLTReturnStatement, SLTIfEqStatement...
  switch (node.type) {
    case "SLTPrintStatement": {
      // node.argument: string (raw argument)
      const argNode = parseArgToNode(node.argument || '""');
      return t.expressionStatement(
        t.callExpression(
          t.memberExpression(t.identifier("console"), t.identifier("log")),
          [argNode]
        )
      );
    }
    case "SLTReturnStatement": {
      const argNode = parseArgToNode(node.argument || "undefined");
      return t.returnStatement(argNode);
    }
    case "SLTIfEqStatement": {
      // node.left, node.right and node.body (array of SLT nodes or regular nodes)
      const leftNode = parseArgToNode(node.left || "undefined");
      const rightNode = parseArgToNode(node.right || "undefined");
      // convert body by recursively transforming each element if it's an SLT node;
      // otherwise, trust it's already a Babel node.
      const bodyStatements = (node.body || []).map(n => {
        if (n && typeof n.type === "string" && n.type.startsWith("SLT")) {
          const transformed = transformSLTNode(n, state);
          // if transform returns an expressionStatement/return/if, wrap appropriately
          return transformed;
        }
        return n;
      }).map(x => {
        // ensure they are statements (if expression, wrap)
        if (!x) return t.emptyStatement();
        return x;
      });
      const consequent = t.blockStatement(bodyStatements);
      const test = t.binaryExpression("===", leftNode, rightNode);
      return t.ifStatement(test, consequent, null);
    }
    default:
      // Unknown SLT node: generate a comment statement for visibility.
      return t.expressionStatement(t.stringLiteral(`/* unsupported SLT node: ${node.type} */`));
  }
}

/**
 * Build a RegExp from localized keys; keys sorted by length desc (to avoid partial matches).
 * Escape keys for regex safety.
 */
function buildLocalizedKeyRegex(keys) {
  const escaped = keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  escaped.sort((a,b) => b.length - a.length);
  return new RegExp("\\b(" + escaped.join("|") + ")\\b", "g");
}

/**
 * Babel plugin entry
 * options:
 *   map: { localized: canonical, ... }
 *   forward: if true, plugin will attempt to do forward codegen; not used by visitor.
 */
module.exports = function(babel) {
  const { types: t } = babel;

  return {
    name: "slt-babel-plugin",
    pre(file) {
      // expose mapping on file.opts for helpers if needed
    },
    visitor: {
      Program(path, state) {
        const mapping = (state.opts && state.opts.map) || {};
        // Build inverse mapping for canonical -> localized (for potential forwardness)
        const inv = {};
        Object.keys(mapping).forEach(k => {
          const v = mapping[k];
          // keep first mapping encountered
          if (!inv[v]) inv[v] = k;
        });
        // Walk top-level body: if any nodes are SLT custom nodes (from Acorn), transform them
        const body = path.node.body;
        const newBody = [];
        for (const node of body) {
          if (node && node.type && node.type.startsWith("SLT")) {
            // transform and push one or many nodes
            const tnode = transformSLTNode(node, state);
            if (tnode) newBody.push(tnode);
            continue;
          }
          newBody.push(node);
        }
        path.node.body = newBody;
      },

      // Replace Identifier names that match localized keywords
      Identifier(path, state) {
        const map = (state.opts && state.opts.map) || {};
        const name = path.node.name;
        if (!name) return;

        // Only replace when the identifier is used in an Identifier context
        // We avoid replacing property keys (object.key) when node is a MemberExpression's property and not computed.
        const parent = path.parent;
        if (t.isMemberExpression(parent) && parent.property === path.node && !parent.computed) {
          // skip property identifiers like obj.función
          return;
        }

        if (Object.prototype.hasOwnProperty.call(map, name)) {
          const canonical = map[name];
          // If canonical is a JS keyword like "return", we cannot rename identifier to "return".
          // In practice localized keywords used as statement keywords will be parsed as part of custom nodes
          // (e.g. SLTReturnStatement). Here we only change identifiers to canonical identifiers.
          if (!["return","if","while","for","class","new","import","export"].includes(canonical)) {
            path.node.name = canonical;
          }
        }
      }
    }
  };
};

/**
 * Post-generation helper:
 * Given generated JS source (string) and a map (localized->canonical),
 * produce localized source by replacing canonical tokens with localized ones.
 *
 * NOTE: This is a string-based approach useful for bootstrapping. For production
 * localized code generation, produce AST and generate with mapping-aware printer.
 */
module.exports.generateLocalizedSource = function(jsSource, map) {
  // Build reverse: canonical -> localized
  const reverse = {};
  Object.keys(map).forEach(local => { const can = map[local]; if (!reverse[can]) reverse[can] = local; });
  const keys = Object.keys(reverse).sort((a,b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\$&'));
  if (keys.length === 0) return jsSource;
  const re = new RegExp("\\b(" + keys.join("|") + ")\\b", "g");
  return jsSource.replace(re, m => reverse[m] || m);
};
