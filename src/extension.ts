'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, commands as Commands } from 'vscode';

import * as fs from 'fs';



export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "angular-file-generator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json


    let disposable = Commands.registerCommand('extension.ngGenerate', async (fileUri) => {


        let modulePath = getModule(fileUri.fsPath);


        let styleType = getStyle(fileUri.fsPath)
        let Name = '';
        let fn = await Window.showInputBox({ placeHolder: 'name-component', prompt: 'Enter new component name.' });
        if (fn) {
            Name = fn.indexOf('.component') > 0 ? fn : `${fn}.component`;
            console.log('component name: ', Name);
        } else {
            Window.showErrorMessage('No filename entered. Cannot generate file.');
            throw new Error('No filename entered. Cannot continue.');
        }
        //generate html
        await fs.writeFile(fileUri.fsPath + '\\' + Name + '.html', generateHtml(Name), (err) => {
            console.log('err', err);
        });
        //generate ts
        await fs.writeFile(fileUri.fsPath + '\\' + Name + '.ts', generateTs(Name), (err) => {
            console.log('err', err);
        });
        //generate scss
        //TODO loop through files in folder for style files and use that extension
        if (this.styleType && this.styleType != '') {
            await fs.writeFile(fileUri.fsPath + '\\' + Name + this.styleType, '', (err) => {
                console.log('err', err);
            });
        }

        //TODO loop through files and find parent module and add component to module

    });
    function getModule(path: string): string {
        let modulePath = '';
        fs.readdir(path, function (err, items) {
            console.log(items);
            items.forEach(fileName => {
                if (modulePath == '' && fileName.indexOf('module') > 0) {
                    modulePath = `${path}\\${fileName}.ts`;
                    return modulePath;
                }
            })
            //didn't find module
            if (this.modulePath == '') {
                var the_arr = path.split('/');
                the_arr.pop();
                modulePath = getModule(the_arr.join('/'));
            }
        });
        return modulePath;
    }
    function getStyle(path: string) {
        return fs.readdir(path, function (err, items) {
            return items.forEach(fileName => {
                let split = fileName.split('.');
                if (split[split.length - 1] == 'css') {
                    return '.css';
                }
                if (split[split.length - 1] == 'scss') {
                    return '.scss';
                }
                if (split[split.length - 1] == 'sass') {
                    return '.sass';
                }
            })
            //didn't find module
            // if (this.modulePath == '') {
            //     var the_arr = path.split('/');
            //     the_arr.pop();
            //     getConfig(the_arr.join('/'));
            // }
        });

    }


    function generateHtml(fileName: String): string {
        return `<h1> ${fileName} component generated </h1>`;
    }

    function generateTs(fileName: String): string {
        const selectorName = fileName.replace('.', '-');
        const compName = fileName.split('.').map(x => x.charAt(0).toUpperCase() + x.substr(1).toLowerCase()).join('');

        return `
import { Component } from '@angular/core';

@Component({
selector: '${selectorName}',
templateUrl: './${fileName}.html',
styleUrls: ['./${fileName}.scss']
})
export class ${compName} {

constructor() {
}

}`;
    }

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}