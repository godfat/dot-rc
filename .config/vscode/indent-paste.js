const vscode = require('vscode');

async function activate() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // Get clipboard content
  const clipboardText = await vscode.env.clipboard.readText();
  if (!clipboardText) {
    return;
  }

  const document = editor.document;
  const selection = editor.selection;
  const position = selection.active;

  // Get current line
  const currentLine = document.lineAt(position.line);
  const lineText = currentLine.text;

  // Check if line contains only whitespace
  if (lineText.trim() === '') {
    // Get the whitespace before cursor as our target indentation
    const targetIndent = lineText.substring(0, position.character);

    // Split clipboard into lines
    const lines = clipboardText.split(/\r?\n/);

    // Find base indentation
    let firstLineHasIndent = true;
    let minIndent = Infinity;
    let firstLineIdx = -1;

    // First, check if first non-empty line has indentation
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        const match = lines[i].match(/^(\s*)/);
        const indent = match ? match[1] : '';
        firstLineIdx = i;
        firstLineHasIndent = indent.length > 0;
        if (firstLineHasIndent) {
          minIndent = indent.length;
        }
        break;
      }
    }

    // If first line has no indentation, find minimum among the rest
    if (!firstLineHasIndent) {
      for (let i = firstLineIdx + 1; i < lines.length; i++) {
        if (lines[i].trim() !== '') {
          const match = lines[i].match(/^(\s*)/);
          const indent = match ? match[1] : '';
          if (indent.length < minIndent) {
            minIndent = indent.length;
          }
        }
      }
    }

    // Build the base indent string
    let baseIndent = '';
    if (minIndent !== Infinity && minIndent > 0) {
      baseIndent = ' '.repeat(minIndent);
    }

    // Process each line
    const adjustedLines = lines.map((line, index) => {
      if (line.trim() === '') {
        return ''; // Keep empty lines empty
      }

      // Special handling for first non-empty line with no indentation
      if (!firstLineHasIndent && index === firstLineIdx) {
        // Just add target indent to the first line
        return targetIndent + line;
      }

      // For other lines, remove base indent and add target indent
      if (line.startsWith(baseIndent)) {
        // Remove base indent and add target indent
        return targetIndent + line.substring(baseIndent.length);
      } else {
        // Line has less indentation than base - shouldn't happen usually
        // but handle it by just adding target indent
        return targetIndent + line.trimStart();
      }
    });

    // Join lines back
    const newText = adjustedLines.join('\n');

    // Replace the entire line with our adjusted content
    await editor.edit(editBuilder => {
      const fullLineRange = new vscode.Range(
        new vscode.Position(position.line, 0),
        new vscode.Position(position.line, lineText.length)
      );
      editBuilder.replace(fullLineRange, newText);
    });

    // Move cursor to end of pasted content
    const lastLineNum = position.line + adjustedLines.length - 1;
    const lastLineLen = adjustedLines[adjustedLines.length - 1].length;
    editor.selection = new vscode.Selection(
      new vscode.Position(lastLineNum, lastLineLen),
      new vscode.Position(lastLineNum, lastLineLen)
    );

  } else {
    // Normal paste on non-empty line
    await editor.edit(editBuilder => {
      if (selection.isEmpty) {
        editBuilder.insert(position, clipboardText);
      } else {
        editBuilder.replace(selection, clipboardText);
      }
    });
  }
}

module.exports = { activate };
