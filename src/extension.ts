'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, commands as Commands } from 'vscode';

import * as fs from 'fs';


export function activate(context: ExtensionContext) {

    console.log('Extension "angular-file-generator" activated');

    let disposable = Commands.registerCommand('ngGenerate.component', async (fileUri) => {

        let modulePath = getModule(fileUri.fsPath);


        let styleType = await getStyle(fileUri.fsPath)
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
        //TODO check setting to see if config wants to generate styles OR provide option
        if (this.styleType && this.styleType != '') {
            await fs.writeFile(fileUri.fsPath + '\\' + Name + this.styleType, '', (err) => {
                console.log('err', err);
            });
        }

        //TODO add component to module
    });

    function addComponentToModule(modulePath: string, name:string){

    }
    
    function getModule(path: string): string {
        let files = [];
        files = fs.readdirSync(path);
        let modulePath = '';

        files.forEach(fileName => {
                if (modulePath == '' && fileName.indexOf('module') > 0) {
                    modulePath = `${path}\\${fileName}`;
                    return;
                }
            })
            //didn't find module
            if (modulePath == '') {
                var the_arr = path.split('/');
                the_arr.pop();
                modulePath = getModule(the_arr.join('/'));
            }
        return modulePath;
    }


    function getStyle(path: string) {
        let files = [];
        files = fs.readdirSync(path);
        let sty = '';
        files.forEach(fileName => {
            let split = fileName.split('.');
            if (split[split.length - 1] == 'css') {
                sty = '.css';
                return;
            }
            if (split[split.length - 1] == 'scss') {
                sty = '.scss';
                return;
            }
            if (split[split.length - 1] == 'sass') {
                sty = '.sass';
                return;
            }
        })
        return sty;
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