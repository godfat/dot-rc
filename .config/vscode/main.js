const vscode = require('vscode');
const textCompletion = require('./text-completion');
const indentPaste = require('./indent-paste');
const stringInterpolation = require('./string-interpolation');

function activate(context) {
  const commands = vscode.commands;

  context.subscriptions.push(
    commands.registerCommand(
      'twilight.textCompletion', textCompletion.execute),
    commands.registerCommand(
      'twilight.indentPaste', indentPaste.execute),
    commands.registerCommand(
      'twilight.stringInterpolation', stringInterpolation.execute),

    commands.registerCommand('twilight.copyRelativeFilePath', () =>
      commands.executeCommand('copyRelativeFilePath')
    ),
    commands.registerCommand('twilight.copyFilePath', () =>
      commands.executeCommand('copyFilePath')
    )
  );
}

function deactivate() {
  completion.deactivate();
}

module.exports = {
  activate,
  deactivate
};
