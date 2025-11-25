const vscode = require('vscode');

let currentSuggestionIndex = 0;
let suggestions = [];
let selectionListener = null;
let isInCyclingMode = false;
let originalState = null;

async function execute() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  if (!isInCyclingMode) {
    startCycling(editor);
  } else {
    cycleToNext(editor);
  }
}

function startCycling(editor) {
  const currentWordRange = getCurrentWordRange(editor);
  if (!currentWordRange) return;

  const currentWord = editor.document.getText(currentWordRange);
  if (!currentWord) return;

  // Store original state
  originalState = {
    text: currentWord,
    range: currentWordRange
  };

  // Get suggestions
  suggestions = getWordSuggestions(editor, currentWord);
  if (suggestions.length === 0) return;

  isInCyclingMode = true;
  currentSuggestionIndex = 0;

  // Start listening for cursor movement to commit
  selectionListener = vscode.window.onDidChangeTextEditorSelection(() => {
    commitCycling();
  });

  // Apply first suggestion
  applySuggestion(editor, suggestions[currentSuggestionIndex]);
}

function cycleToNext(editor) {
  if (!isInCyclingMode || suggestions.length === 0) return;

  currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
  applySuggestion(editor, suggestions[currentSuggestionIndex]);
}

function applySuggestion(editor, suggestionWord) {
  const currentWordRange = getCurrentWordRange(editor);
  if (!currentWordRange) return;

  // Temporarily disable the selection listener during our edit
  const wasListening = selectionListener !== null;
  if (wasListening) {
    selectionListener.dispose();
    selectionListener = null;
  }

  editor.edit(edit => {
    edit.replace(currentWordRange, suggestionWord);
  }, {
    undoStopBefore: false,
    undoStopAfter: false
  }).then(() => {
    // Re-enable the listener after edit is complete
    if (wasListening && isInCyclingMode) {
      selectionListener = vscode.window.onDidChangeTextEditorSelection(() => {
        commitCycling();
      });
    }
  });
}

function commitCycling() {
  isInCyclingMode = false;
  originalState = null;
  suggestions = [];
  currentSuggestionIndex = 0;

  // Clean up listener
  if (selectionListener) {
    selectionListener.dispose();
    selectionListener = null;
  }
}

function getCurrentWordRange(textEditor) {
  const position = textEditor.selection.active;

  // If we're in cycling mode, use the original range as reference
  if (isInCyclingMode && originalState) {
    const line = textEditor.document.lineAt(originalState.range.start.line);
    const lineText = line.text;

    // Find where the current word starts (should be same as original)
    const startChar = originalState.range.start.character;

    // Find where current word ends
    let endChar = startChar;
    while (endChar < lineText.length && /\w/.test(lineText[endChar])) {
      endChar++;
    }

    return new vscode.Range(
      new vscode.Position(originalState.range.start.line, startChar),
      new vscode.Position(originalState.range.start.line, endChar)
    );
  }

  const wordRange = textEditor.document.getWordRangeAtPosition(position);

  if (wordRange) {
    return wordRange;
  }

  // If no word at position, try to get partial word before cursor
  const lineText = textEditor.document.lineAt(position.line).text;
  const beforeCursor = lineText.substring(0, position.character);

  // Find word boundaries
  const wordMatch = beforeCursor.match(/\w+$/);
  if (wordMatch) {
    const startChar = position.character - wordMatch[0].length;
    const start = new vscode.Position(position.line, startChar);
    const end = position;
    return new vscode.Range(start, end);
  }

  return null;
}

function getWordSuggestions(textEditor, currentWord) {
  const document = textEditor.document;
  const currentPosition = textEditor.selection.active;
  const wordDistances = new Map(); // word -> minimum distance

  const text = document.getText();
  const wordRegex = /\b\w+\b/g;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];

    if (word === currentWord || !word.startsWith(currentWord)) {
      continue;
    }

    const matchPosition = document.positionAt(match.index);

    // Words on nearby lines are much more relevant than distant ones
    const lineDiff = Math.abs(matchPosition.line - currentPosition.line);
    const distance = lineDiff * 2 + (matchPosition.line < currentPosition.line ? 0 : 1);

    // Keep the closest occurrence of each word
    const existing = wordDistances.get(word);
    if (existing === undefined || distance < existing) {
      wordDistances.set(word, distance);
    }
  }

  // Sort by distance and return words
  return Array.from(wordDistances.entries()).
    sort((a, b) => a[1] - b[1]).
    map(([word]) => word);
}

function deactivate() {
  commitCycling();
}

module.exports = { execute, deactivate };
