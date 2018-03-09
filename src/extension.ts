'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace as Workspace, window as Window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, commands as Commands, QuickPickItem, QuickPickOptions } from 'vscode';

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
        let fn = await Window.showInputBox({ placeHolder: 'name-module', prompt: 'Enter new module name.' });
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

        let items: QuickPickItem[] = [];
        items.push({
            label: 'Yes',
            description: ' - Add style file',
        });
        items.push({
            label: 'No',
            description: ' - Exclude style file'
        });
        let yesnoAdd = await Window.showQuickPick(items, { placeHolder: 'Add Stylesheet to generated Component' });
        let add = yesnoAdd && yesnoAdd.label == 'Yes' ? true : false;

        if (fn) {
            // append name of object to component if it does not already have it
            // may need to break this out to a config setting
            Name = sanitize(fn.indexOf('.component') > 0 ? fn : `${fn}.component`);
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
        if (add && styleType && styleType != '') {
            await fs.writeFile(path + '\\' + Name + styleType, '', (err) => {
                console.log('err', err);
            });
        }

        Window.showInformationMessage('Component Files generated.');
        // //TODO add component to module

        if (modulePath) {
            addToModule(modulePath, Name, path)
        }
    });

    async function addToModule(modulePath: string, componentName: string, componentPath: string) {
        let items: QuickPickItem[] = [];
        items.push({
            label: 'Yes',
            description: ' - Add to module',
        });
        items.push({
            label: 'No',
            description: ' - Do not add to module'
        });
        let yesnoAdd = await Window.showQuickPick(items, { placeHolder: 'Add generated Component to parent module' });
        let add = yesnoAdd && yesnoAdd.label == 'Yes' ? true : false;
        if (!add) {
            return;
        }

        const compName = componentName.split('.').map(x => x.charAt(0).toUpperCase() + x.substr(1).toLowerCase()).join('');

        var the_arr = modulePath.split('\\');
        the_arr.pop();
        var modulePathNoFilename = the_arr.join('\\');
        var cp = componentPath.replace(modulePathNoFilename, '');

        if (cp == '') {
            componentPath = `./${componentName}`
        } else {
            componentPath = `.${cp.replace(/\\/g, '/')}/${componentName}`;
        }


        var x = await fs.readFileSync(modulePath).toString();

        //adding the import statement
        const importStatement = `
import { ${compName} } from '${componentPath}';

@NgModule`;

        x = x.replace('@NgModule', importStatement);

        //adding to the declarations of the module
        var declarations = `
declarations: [
${compName},`;

        x = x.replace('declarations: [', declarations);

        console.log("Asynchronous read: " + x.toString());
        fs.writeFileSync(modulePath, x)

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
            var the_arr = path.split('\\');
            the_arr.pop();
            modulePath = getModule(the_arr.join('\\'));
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
            var the_arr = path.split('\\');
            the_arr.pop();
            sty = getStyle(the_arr.join('\\'));
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
styleUrls: ['./${fileName}${styleType}']
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