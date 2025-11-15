
How to use the plugin

1. Install @babel/core in your project (peer dep):



    pnpm add -D @babel/core @babel/cli

2. Create a babel.config.js at repository root:



    module.exports = {
      plugins: [
        [ require.resolve("./packages/slt-babel-plugin/lib/index.js"), {
          map: require("./packages/@slt-lang/es/index.json").map
        } ]
      ]
    };

3. Run Babel transform:



    npx babel input.js --config-file ./babel.config.js --out-file out.js

If you are feeding Babel an AST produced by an SLT-aware parser (e.g. Acorn extended parser that emits SLTPrintStatement nodes), the plugin will convert those to canonical JS statements (console.log, return, if) at the top-of-tree Program visitor.


---

Notes & Limitations

Identifier renaming vs keywords: return, if etc. are JS keywords; Babel's parser will not allow them as identifier names. The plugin avoids turning identifiers into reserved keywords. In practice, localized statement-level keywords should be parsed into custom SLT AST nodes by a parsing step (Acorn plugin) so that they are transformed into correct AST nodes rather than attempted identifier renames.

Custom SLT AST nodes: The plugin supports a few SLT node types (SLTPrintStatement, SLTReturnStatement, SLTIfEqStatement) with simple argument parsing heuristics. For production, produce full AST node shapes from your parser so the Babel plugin can transform correctly.

Forward generation: generateLocalizedSource does a text-based swap. This is useful for "initialize project" flows but will not be as robust as generating localized code from AST nodes (which is the longer-term design).



---

Example: full pipeline idea

1. Parsing: Use an SLT-capable parser (Acorn extended) to produce an AST possibly containing SLT* nodes.


2. Babel transform: Feed AST into Babel with slt-babel-plugin to convert SLT AST nodes into canonical JS AST nodes, and rename identifiers according to the map.


3. Codegen: Use @babel/generator to produce JS source and optionally feed that to generateLocalizedSource if you want to output localized-ized source.

