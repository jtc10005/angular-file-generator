'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, commands as Commands } from 'vscode';

import * as fs from 'fs';
import * as sanitize from 'sanitize-filename';


export function activate(context: ExtensionContext) {

    console.log('Extension "angular-file-generator" activated');

    let disposable = Commands.registerCommand('ngGenerate.module', async (fileUri) => {
        let path = fileUri.fsPath;
        // if path contains file name, need to remove this for the correct path
        // this is only an issue if the scheme is a file
        if (fs.lstatSync(path).isFile()) {
            var the_arr = path.split('\\');
            the_arr.pop();
            path = the_arr.join('\\');
        }

        // if no path stop
        if (!path || path == '') {
            Window.showErrorMessage('No path located. Cannot continue.');
            throw new Error('No path located. Cannot continue.');
        }
        // User input filename
        let Name = '';
        let fn = await Window.showInputBox({ placeHolder: 'name-component', prompt: 'Enter new module name.' });
        if (fn) {
            // append name of object to component if it does not already have it
            // may need to break this out to a config setting
            Name = sanitize(fn.indexOf('.module') > 0 ? fn : `${fn}.module`);
            console.log('module name: ', Name);
        } else {
            // no file name enter, no continue
            Window.showErrorMessage('No module name entered. Cannot generate file.');
            throw new Error('No module name entered. Cannot continue.');
        }

        //generate module
        await fs.writeFile(path + '\\' + Name + '.ts', generateModule(Name), (err) => {
            console.log('err', err);
        });
        Window.showInformationMessage('Module generated.');
    })

    context.subscriptions.push(disposable);

    disposable = Commands.registerCommand('ngGenerate.component', async (fileUri) => {


        let path = fileUri.fsPath;
        // if path contains file name, need to remove this for the correct path
        // this is only an issue if the scheme is a file
        if (fs.lstatSync(path).isFile()) {
            var the_arr = path.split('\\');
            the_arr.pop();
            path = the_arr.join('\\');
        }

        // if no path stop
        if (!path || path == '') {
            Window.showErrorMessage('No path located. Cannot continue.');
            throw new Error('No path located. Cannot continue.');
        }

        //get the path of the first parent module
        let modulePath = getModule(path);

        // get the style type in the project
        let styleType = await getStyle(path)

        // User input filename
        let Name = '';
        let fn = await Window.showInputBox({ placeHolder: 'name-component', prompt: 'Enter new component name.' });
        if (fn) {
            // append name of object to component if it does not already have it
            // may need to break this out to a config setting
            Name = sanitize(fn.indexOf('.module') > 0 ? fn : `${fn}.module`);
            console.log('component name: ', Name);
        } else {
            // no file name enter, no continue
            Window.showErrorMessage('No filename entered. Cannot generate file.');
            throw new Error('No filename entered. Cannot continue.');
        }

        //generate html
        await fs.writeFile(path + '\\' + Name + '.html', generateHtml(Name), (err) => {
            console.log('err', err);
        });
        //generate ts
        await fs.writeFile(path + '\\' + Name + '.ts', generateTs(Name, styleType), (err) => {
            console.log('err', err);
        });
        //generate scss
        //TODO check setting to see if config wants to generate styles OR provide option
        if (styleType && styleType != '') {
            await fs.writeFile(path + '\\' + Name + styleType, '', (err) => {
                console.log('err', err);
            });
        }

        //TODO add component to module

        Window.showInformationMessage('Files generated.');
    });

    function addComponentToModule(modulePath: string, name: string) {

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
            let extension = split[split.length - 1];
            switch (extension) {
                case 'css':
                    sty = '.css';
                    break;
                case 'scss':
                    sty = '.scss';
                    break;
                case 'sass':
                    sty = '.sass';
                    break;
            }
            if (sty != '') {
                return;
            }

        })

        if (sty == '') {
            var the_arr = path.split('/');
            the_arr.pop();
            sty = getStyle(the_arr.join('/'));
        }
        return sty;
    }

    /**
     * Generate html component file stuff
     * @param fileName Name of the component being generated
     */
    function generateHtml(fileName: String): string {
        return `<h1> ${fileName} component generated </h1>`;
    }

    /**
     * Generate ts component file stuff
     * @param fileName Name of the component being generated
     */
    function generateTs(fileName: String, styleType: string): string {
        const selectorName = fileName.replace('.', '-');
        const compName = fileName.split('.').map(x => x.charAt(0).toUpperCase() + x.substr(1).toLowerCase()).join('');

        return `
import { Component } from '@angular/core';

@Component({
selector: '${selectorName}',
templateUrl: './${fileName}.html',
styleUrls: ['./${fileName}.${styleType}']
})
export class ${compName} {

constructor() {
}

}`;
    }

    /**
     * Generate ts component file stuff
     * @param fileName Name of the component being generated
     */
    function generateModule(fileName: String): string {
        const selectorName = fileName.replace('.', '-');
        const compName = fileName.split('.').map(x => x.charAt(0).toUpperCase() + x.substr(1).toLowerCase()).join('');

        return `
        import { NgModule } from '@angular/core';
    
        
        @NgModule({
          declarations: [],
          imports: [],
          providers: []
        })
        export class ${compName} { }`;
    }
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}