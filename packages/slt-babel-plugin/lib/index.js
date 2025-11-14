// Babel plugin for SLT: it replaces certain Identifier node names with canonical keywords
module.exports = function({ types: t }) {
  return {
    name: "slt-babel-plugin",
    visitor: {
      Program(path, state) {
        const map = (state.opts && state.opts.map) || {};
        path.traverse({
          Identifier(p) {
            const name = p.node.name;
            if (!name) return;
            if (map[name]) {
              p.node.name = map[name];
            }
          }
        });
      }
    }
  };
};