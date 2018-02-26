'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, commands as Commands } from 'vscode';
import { FileController } from './file-controller';

export function activate(context: ExtensionContext) {



    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "angular-file-generator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = Commands.registerCommand('extension.ngGenerate', async () => {
        const File = new FileController().readSettings();
        // The code you place here will be executed every time your command is executed
        // let n1 = vscode.workspace.onDidChangeWorkspaceFolders(e => {
        //     console.log(e);
        // });

        //https://github.com/dkundel/vscode-new-file/tree/master/src
        const root = await File.determineRoot();
        let Name = '';
        let fn = await Window.showInputBox({ placeHolder: 'name-component', prompt: 'Enter new component name.' });
        let x = await Workspace.workspaceFolders;
        // .then(fn => {
        // let success = await Commands.executeCommand('vscode.copyFilePath');
        //if filename then check if '-component' text is included if its not then add it
        if (fn) {
            Name = fn.indexOf('-component') > 0 ? fn : `${fn}-component`;
            console.log('component name: ', Name);
        } else {
            Window.showErrorMessage('No filename entered. Cannot generate file.');
            throw new Error('No filename entered. Cannot continue.');
        }
        // let x = vscode.window.showWorkspaceFolderPick().then(res => console.log(res));
        // console.log('commands', success);
        // });


    });


    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}