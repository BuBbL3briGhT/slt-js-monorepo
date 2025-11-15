export function createHighlighter(editor, keywords) {
  const styled = new RegExp("\\b(" + keywords.join("|") + ")\\b", "g");

  editor.on("change", () => {
    const doc = editor.getDoc();
    const text = doc.getValue();

    // Clear old marks
    editor.getAllMarks().forEach(m => m.clear());

    let match;
    while ((match = styled.exec(text)) !== null) {
      const start = editor.posFromIndex(match.index);
      const end = editor.posFromIndex(match.index + match[0].length);
      editor.markText(start, end, { className: "slt-keyword" });
    }
  });
}
