const vscode = require('vscode');
const completion = require('./text-completion');

function activate(context) {
  const disposable = vscode.commands.
    registerCommand('twilightTextCompletion.cycle', completion.activate);

  context.subscriptions.push(disposable);
}

function deactivate() {
  completion.deactivate();
}

module.exports = {
  activate,
  deactivate
};
