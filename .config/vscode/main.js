const vscode = require('vscode');
const textComplete = require('./text/text-complete');
const indentPaste = require('./text/indent-paste');
const stringInterpolate = require('./ruby/string-interpolate');
const tagComplete = require('./html/tag-complete')

function activate(context) {
  const commands = vscode.commands;

  context.subscriptions.push(
    commands.registerCommand(
      'twilight.textComplete', textComplete.execute),
    commands.registerCommand(
      'twilight.indentPaste', indentPaste.execute),
    commands.registerCommand(
      'twilight.stringInterpolate', stringInterpolate.execute),
    commands.registerCommand(
      'twilight.tagComplete', tagComplete.execute),

    commands.registerCommand('twilight.copyRelativeFilePath', () =>
      commands.executeCommand('copyRelativeFilePath')
    ),
    commands.registerCommand('twilight.copyFilePath', () =>
      commands.executeCommand('copyFilePath')
    )
  );
}

function deactivate() {
  textComplete.deactivate();
}

module.exports = {
  activate,
  deactivate
};
