const vscode = require('vscode');

function canInterpolateString(document, position) {
  const line = document.lineAt(position.line).text;
  const beforeCursor = line.substring(0, position.character);

  // Remove escaped characters from consideration
  const cleanedText = beforeCursor.replace(/\\./g, '');

  // Check double quotes first (most common)
  const doubleQuotes = (cleanedText.match(/"/g) || []).length;
  if (doubleQuotes % 2 === 1) return true;

  // Check slashes (regex)
  const slashes = (cleanedText.match(/\//g) || []).length;
  if (slashes % 2 === 1) return true;

  // Check backticks
  const backticks = (cleanedText.match(/`/g) || []).length;
  if (backticks % 2 === 1) return true;

  // No percent literal pattern found
  if (!cleanedText.match(/%[Qr]?[{[\(<|]/)) return false;

  // We have a percent literal, check delimiter balance
  const curlyBraces = (cleanedText.match(/{/g) || []).length - (cleanedText.match(/}/g) || []).length;
  if (curlyBraces > 0) return true;

  const squareBrackets = (cleanedText.match(/\[/g) || []).length - (cleanedText.match(/\]/g) || []).length;
  if (squareBrackets > 0) return true;

  const parentheses = (cleanedText.match(/\(/g) || []).length - (cleanedText.match(/\)/g) || []).length;
  if (parentheses > 0) return true;

  const angleBrackets = (cleanedText.match(/</g) || []).length - (cleanedText.match(/>/g) || []).length;
  if (angleBrackets > 0) return true;

  // Pipes need odd count (they're same open/close delimiter)
  const pipes = (cleanedText.match(/\|/g) || []).length;
  if (pipes % 2 === 1) return true;

  return false;
}

async function execute() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  if (editor.selection.isEmpty) {
    const position = editor.selection.active;

    if (canInterpolateString(editor.document, position)) {
      // Insert #{} and position cursor inside
      const snippet = new vscode.SnippetString('#{$1}');
      await editor.insertSnippet(snippet, position);
    } else {
      // Insert # normally when not in a string
      await editor.edit(editBuilder => {
        editBuilder.insert(position, '#');
      });
    }
  } else {
    // Wrap the selected text with #{}
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    await editor.edit(editBuilder => {
      editBuilder.replace(selection, `#{${selectedText}}`);
    });
  }
}

module.exports = { execute };
