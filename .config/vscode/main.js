const vscode = require('vscode');
const completion = require('./text-completion');
const paste = require('./indent-paste');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.
      registerCommand('twilightTextCompletion.cycle', completion.activate)
  );

  context.subscriptions.push(
    vscode.commands.
      registerCommand('twilight.paste', paste.activate)
  );
}

function deactivate() {
  completion.deactivate();
}

module.exports = {
  activate,
  deactivate
};
