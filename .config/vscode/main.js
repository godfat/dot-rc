const vscode = require('vscode');
const completion = require('./text-completion');
const paste = require('./indent-paste');
const stringInterpolation = require('./string-interpolation');

function activate(context) {
  const commands = vscode.commands;

  context.subscriptions.push(
    commands.registerCommand('twilight.completion.cycle', completion.activate),
    commands.registerCommand('twilight.paste', paste.activate),
    commands.registerCommand(
      'twilight.stringInterpolation', stringInterpolation.execute
    ),

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
