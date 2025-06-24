const vscode = require('vscode');

let currentSuggestionIndex = 0;
let suggestions = [];
let selectionListener = null;
let isInCyclingMode = false;
let originalState = null;

function activate(context) {
  const disposable = vscode.commands.registerCommand('anotherWordCompletion.cycle', () => {
    const textEditor = vscode.window.activeTextEditor;
    if (!textEditor) {
      return;
    }

    if (!isInCyclingMode) {
      startCycling(textEditor);
    } else {
      cycleToNext(textEditor);
    }
  });

  context.subscriptions.push(disposable);
}

function startCycling(textEditor) {
  const currentWordRange = getCurrentWordRange(textEditor);
  if (!currentWordRange) {
    return;
  }

  const currentWord = textEditor.document.getText(currentWordRange);
  if (!currentWord) {
    return;
  }

  // Store original state
  originalState = {
    text: currentWord,
    range: currentWordRange
  };

  // Get suggestions
  suggestions = getWordSuggestions(textEditor, currentWord);
  if (suggestions.length === 0) {
    return;
  }

  isInCyclingMode = true;
  currentSuggestionIndex = 0;

  // Start listening for cursor movement to commit
  selectionListener = vscode.window.onDidChangeTextEditorSelection(() => {
    commitCycling();
  });

  // Apply first suggestion
  applySuggestion(textEditor, suggestions[currentSuggestionIndex]);
}

function cycleToNext(textEditor) {
  if (!isInCyclingMode || suggestions.length === 0) {
    return;
  }

  currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
  applySuggestion(textEditor, suggestions[currentSuggestionIndex]);
}

function applySuggestion(textEditor, suggestionWord) {
  const currentWordRange = getCurrentWordRange(textEditor);
  if (!currentWordRange) {
    return;
  }

  // Temporarily disable the selection listener during our edit
  const wasListening = selectionListener !== null;
  if (wasListening) {
    selectionListener.dispose();
    selectionListener = null;
  }

  textEditor.edit(edit => {
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
  const wordSet = new Set();
  const suggestions = [];

  // Get all text from document
  const text = document.getText();

  // Simple word extraction regex - matches word characters
  const wordRegex = /\b\w+\b/g;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];

    // Skip if same as current word or doesn't start with current word
    if (word === currentWord || !word.toLowerCase().startsWith(currentWord.toLowerCase())) {
      continue;
    }

    // Skip if already found
    if (wordSet.has(word)) {
      continue;
    }

    wordSet.add(word);

    // Calculate distance from current position
    const matchPosition = document.positionAt(match.index);
    const distance = Math.abs(matchPosition.line - currentPosition.line) +
            Math.abs(matchPosition.character - currentPosition.character);

    suggestions.push({ word, distance });
  }

  // Sort by distance (closest first)
  suggestions.sort((a, b) => a.distance - b.distance);

  // Return just the words
  return suggestions.map(s => s.word);
}

function deactivate() {
  commitCycling();
}

module.exports = {
  activate,
  deactivate
};
