const vscode = require('vscode');

function findUnclosedTag(document, position) {
  const text = document.getText(new vscode.Range(0, 0, position.line, position.character));

  const openTags = [];
  const tagRegex = /<\/?([a-z][a-z0-9-]*)[^>]*\/?>/ig;

  for (const match of text.matchAll(tagRegex)) {
    const tagName = match[1];
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = match[0].endsWith('/>');

    if (isClosing) {
      for (let i = openTags.length - 1; i >= 0; i--) {
        if (openTags[i].toLowerCase() === tagName.toLowerCase()) {
          openTags.splice(i, 1);
          break;
        }
      }
    } else if (!isSelfClosing) {
      openTags.push(tagName);
    }
  }

  return openTags.length > 0 ? openTags[openTags.length - 1] : null;
}

async function execute() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const position = editor.selection.active;
  const line = document.lineAt(position.line).text;
  const charBefore = position.character > 0
    ? line[position.character - 1]
    : '';

  if (charBefore === '<') {
    const unclosedTag = findUnclosedTag(document, position);
    if (unclosedTag) {
      // Replace the '<' with the full closing tag
      const replaceRange = new vscode.Range(
        position.line, position.character - 1,
        position.line, position.character
      );

      // Check if tag is empty: char before '<' is '>'
      const charBeforeOpen = position.character > 1
        ? line[position.character - 2]
        : '';
      const isEmpty = charBeforeOpen === '>';

      const snippet = isEmpty
        ? new vscode.SnippetString(`$0</${unclosedTag}>`)
        : new vscode.SnippetString(`</${unclosedTag}>$0`);

      await editor.insertSnippet(snippet, replaceRange);
      return;
    }
  }

  // Default: just insert /
  await editor.edit(editBuilder => {
    editBuilder.insert(position, '/');
  });
}

module.exports = { execute };
