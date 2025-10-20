const vscode = require('vscode');

async function execute() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  if (editor.selection.isEmpty) {
    // Insert # normally when there's no selected text
    await editor.edit(editBuilder => {
      editBuilder.insert(editor.selection.active, '#');
    });
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
