const vscode = require('vscode');

async function activate() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const clipboardText = await vscode.env.clipboard.readText();
  if (!clipboardText) {
    return;
  }

  const document = editor.document;
  const selection = editor.selection;
  const position = selection.active;

  const currentLine = document.lineAt(position.line);
  const lineText = currentLine.text;

  // Check if line contains only whitespace
  if (lineText.trim() !== '') {
    // Normal paste on non-empty line
    await editor.edit(editBuilder => {
      if (selection.isEmpty) {
        editBuilder.insert(position, clipboardText);
      } else {
        editBuilder.replace(selection, clipboardText);
      }
    });
    return;
  }

  // Smart indentation paste
  const targetIndent = lineText.substring(0, position.character);
  const lines = clipboardText.split(/\r?\n/);

  // Find base indentation info
  const { baseIndent, firstNonEmptyIndex, firstLineHasIndent } = findBaseIndentation(lines);

  // Adjust each line
  const adjustedLines = lines.map((line, index) =>
    adjustLineIndentation(line, index, baseIndent, targetIndent, firstNonEmptyIndex, firstLineHasIndent)
  );

  const newText = adjustedLines.join('\n');

  // Replace the entire line
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
}

function getLineIndentation(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

function findBaseIndentation(lines) {
  let firstNonEmptyIndex = -1;
  let firstLineHasIndent = true;

  // Find first non-empty line
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      firstNonEmptyIndex = i;
      firstLineHasIndent = getLineIndentation(lines[i]).length > 0;
      break;
    }
  }

  if (firstNonEmptyIndex === -1) {
    return { baseIndent: '', firstNonEmptyIndex, firstLineHasIndent };
  }

  // Calculate minimum indentation
  let minIndentLength = Infinity;

  if (firstLineHasIndent) {
    // If first line has indentation, include it in the calculation
    minIndentLength = getLineIndentation(lines[firstNonEmptyIndex]).length;
  } else {
    // If first line has no indentation, find min from the rest
    for (let i = firstNonEmptyIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        const indentLength = getLineIndentation(lines[i]).length;
        minIndentLength = Math.min(minIndentLength, indentLength);
      }
    }
  }

  const baseIndent = minIndentLength === Infinity ? '' : ' '.repeat(minIndentLength);

  return { baseIndent, firstNonEmptyIndex, firstLineHasIndent };
}

function adjustLineIndentation(line, lineIndex, baseIndent, targetIndent, firstNonEmptyIndex, firstLineHasIndent) {
  if (line.trim() === '') {
    return '';
  }

  // Special handling for first non-empty line with no indentation
  if (!firstLineHasIndent && lineIndex === firstNonEmptyIndex) {
    return targetIndent + line;
  }

  // For other lines, adjust indentation
  if (line.startsWith(baseIndent)) {
    return targetIndent + line.substring(baseIndent.length);
  }

  // Fallback: line has less indentation than expected
  return targetIndent + line.trimStart();
}

module.exports = { activate };
