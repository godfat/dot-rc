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
  let selection = editor.selection;

  // If there's a selection, delete it first without creating an undo stop
  const hadSelection = !selection.isEmpty;
  if (hadSelection) {
    await editor.edit(editBuilder => {
      editBuilder.delete(selection);
    }, { undoStopBefore: true, undoStopAfter: false });

    // Update selection after deletion
    selection = editor.selection;
  }

  // Now proceed with paste logic
  const position = selection.active;
  const currentLine = document.lineAt(position.line);
  const lineText = currentLine.text;

  // Check if line contains only whitespace
  if (lineText.trim() !== '') {
    // Normal paste on non-empty line
    await editor.edit(editBuilder => {
      editBuilder.insert(position, clipboardText);
    }, { undoStopBefore: !hadSelection, undoStopAfter: true });
    return;
  }

  // Smart indentation paste (on empty line)
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
  }, { undoStopBefore: !hadSelection, undoStopAfter: true });

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

  // Find the common prefix (handles both tabs and spaces)
  let baseIndent = '';

  if (firstLineHasIndent) {
    // Start with first line's indentation
    baseIndent = getLineIndentation(lines[firstNonEmptyIndex]);
  } else {
    // Find shortest indentation from other lines
    let shortestIndent = null;
    for (let i = firstNonEmptyIndex + 1; i < lines.length; i++) {
      if (lines[i].trim() !== '') {
        const indent = getLineIndentation(lines[i]);
        if (shortestIndent === null || indent.length < shortestIndent.length) {
          shortestIndent = indent;
        }
      }
    }
    baseIndent = shortestIndent || '';
  }

  // Verify that all non-empty lines start with this base indent
  // and find the true common prefix
  for (let i = firstNonEmptyIndex; i < lines.length; i++) {
    if (lines[i].trim() !== '') {
      const lineIndent = getLineIndentation(lines[i]);

      // Skip first line if it has no indentation
      if (!firstLineHasIndent && i === firstNonEmptyIndex) {
        continue;
      }

      // Find common prefix between baseIndent and this line's indent
      let commonLength = 0;
      while (commonLength < baseIndent.length &&
             commonLength < lineIndent.length &&
             baseIndent[commonLength] === lineIndent[commonLength]) {
        commonLength++;
      }

      if (commonLength < baseIndent.length) {
        baseIndent = baseIndent.substring(0, commonLength);
      }
    }
  }

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
