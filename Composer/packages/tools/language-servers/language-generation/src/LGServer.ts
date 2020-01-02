// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { readFile } from 'fs';
import * as path from 'path';

import { xhr, getErrorStatusDescription } from 'request-light';
import URI from 'vscode-uri';
import { IConnection, TextDocuments } from 'vscode-languageserver';
import {
  TextDocument,
  Diagnostic,
  CompletionList,
  Hover,
  CompletionItemKind,
  CompletionItem,
  Range,
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import get from 'lodash/get';
import { LGTemplate, Diagnostic as LGDiagnostic } from 'botbuilder-lg';

import { buildInfunctionsMap } from './builtinFunctionsMap';
import {
  getRangeAtPosition,
  getLGResources,
  updateTemplateInContent,
  getTemplateRange,
  LGDocument,
  checkText,
  checkTemplate,
  convertDiagnostics,
  isValid,
  TRange,
  loadMemoryVariavles,
} from './utils';

// define init methods call from client
const InitializeDocumentsMethodName = 'initializeDocuments';

const allowedCompletionStates = ['expression'];

export class LGServer {
  protected workspaceRoot?: URI;
  protected readonly documents = new TextDocuments();
  protected readonly pendingValidationRequests = new Map<string, number>();
  protected LGDocuments: LGDocument[] = []; // LG Documents Store
  private readonly memoryVariables: object;

  constructor(protected readonly connection: IConnection) {
    this.documents.listen(this.connection);
    this.documents.onDidChangeContent(change => this.validate(change.document));
    this.documents.onDidClose(event => {
      this.cleanPendingValidation(event.document);
      this.cleanDiagnostics(event.document);
    });

    this.connection.onInitialize(params => {
      if (params.rootPath) {
        this.workspaceRoot = URI.file(params.rootPath);
      } else if (params.rootUri) {
        this.workspaceRoot = URI.parse(params.rootUri);
      }
      this.connection.console.log('The server is initialized.');
      return {
        capabilities: {
          textDocumentSync: this.documents.syncKind,
          codeActionProvider: false,
          completionProvider: {
            resolveProvider: true,
            triggerCharacters: ['.'],
          },
          hoverProvider: true,
          foldingRangeProvider: false,
        },
      };
    });
    this.connection.onCompletion(params => this.completion(params));
    this.connection.onHover(params => this.hover(params));

    this.connection.onRequest((method, params) => {
      if (InitializeDocumentsMethodName === method) {
        const { uri, inline = false, content, template } = params;
        this.LGDocuments.push({ uri, inline, content, template });
        // run diagnostic
        const textDocument = this.documents.get(uri);
        if (textDocument) {
          this.validate(textDocument);
        }
      }
    });

    const curPath = __dirname;
    const targetPath = path.join(curPath, '../resources/memoryVariables.json');
    this.memoryVariables = loadMemoryVariavles(targetPath);
  }

  start() {
    this.connection.listen();
  }

  protected getLGDocument(document: TextDocument): LGDocument | undefined {
    return this.LGDocuments.find(({ uri }) => uri === document.uri);
  }
  protected getLGDocumentContent(document: TextDocument): string {
    const LGDocument = this.LGDocuments.find(item => item.uri === document.uri);
    const text = document.getText();
    if (LGDocument && LGDocument.inline) {
      const { content, template } = LGDocument;
      if (!content || !template) return text;
      const updatedTemplate = {
        name: template.name,
        parameters: template.parameters,
        body: text,
      };

      const templateDiags = checkTemplate(updatedTemplate);
      if (isValid(templateDiags)) {
        return updateTemplateInContent(content, updatedTemplate);
      }
    }
    return text;
  }

  protected hover(params: TextDocumentPositionParams): Thenable<Hover | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const text = this.getLGDocumentContent(document);
    const lgResources = getLGResources(text);
    const templates = lgResources.templates;
    const wordRange = getRangeAtPosition(document, params.position);
    let word = document.getText(wordRange);
    const matchItem = templates.find(u => u.name === word);
    if (matchItem) {
      const hoveritem: Hover = { contents: [matchItem.body] };
      return Promise.resolve(hoveritem);
    }
    if (word.startsWith('builtin.')) {
      word = word.substring(8);
    }

    if (buildInfunctionsMap.has(word)) {
      const functionEntity = buildInfunctionsMap.get(word);
      if (!functionEntity) {
        return Promise.resolve(null);
      }
      const hoveritem: Hover = {
        contents: [
          `Parameters: ${get(functionEntity, 'Params', []).join(', ')}`,
          `Documentation: ${get(functionEntity, 'Introduction', '')}`,
          `ReturnType: ${get(functionEntity, 'Returntype', '').valueOf()}`,
        ],
      };
      return Promise.resolve(hoveritem);
    }
    return Promise.resolve(null);
  }

  protected async resolveSchema(url: string): Promise<string> {
    const uri = URI.parse(url);
    if (uri.scheme === 'file') {
      return new Promise<string>((resolve, reject) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        readFile(uri.fsPath, 'UTF-8', (err, result) => {
          err ? reject('') : resolve(result.toString());
        });
      });
    }
    try {
      const response = await xhr({ url, followRedirects: 5 });
      return response.responseText;
    } catch (error) {
      return Promise.reject(error.responseText || getErrorStatusDescription(error.status) || error.toString());
    }
  }

  private removeParamFormat(params: string): string {
    const resultArr = params.split(',').map(element => {
      return element.trim().split(':')[0];
    });
    return resultArr.join(' ,');
  }

  private matchedStates(params: TextDocumentPositionParams): { matched: boolean; state: string } | null {
    const state: string[] = [];
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return null;
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const lineContent = document.getText(range);
    if (!lineContent.trim().startsWith('-')) {
      return { matched: false, state: '' };
    }

    //initialize the root state to plaintext
    state.push('PlainText');

    // find out the context state of current cursor, offer precise suggestion and completion etc.
    /**
     * - Hi, @{name}, what's the meaning of 'state'
     * - Hi---------, @{name}--------, what-------' ------s the meaning of "state"
     * - <plaintext>, @{<expression>}, <plaintext><single><plaintext>------<double>
     * in LG, functions and template can only be valid in expression.
     * expression means a valid expression, eg: @{add(1,2)}
     * single means single quote string,  eg: 'hello world'
     * double means double quote string, eg: "hello world"
     * including single and double since "@{text}" is a string rather that expression.
     * plaintext means text after dash, eg: - Today is monday
     */
    let i = 0;
    while (i < lineContent.length) {
      const char = lineContent.charAt(i);
      if (char === `'`) {
        if (state[state.length - 1] === 'expression' || state[state.length - 1] === 'double') {
          state.push('single');
        } else {
          state.pop();
        }
      }

      if (char === `"`) {
        if (state[state.length - 1] === 'expression' || state[state.length - 1] === 'single') {
          state.push('double');
        } else {
          state.pop();
        }
      }

      if (char === '{' && i >= 1 && state[state.length - 1] !== 'single' && state[state.length - 1] !== 'double') {
        if (lineContent.charAt(i - 1) === '@') {
          state.push('expression');
        }
      }

      if (char === '}' && state[state.length - 1] === 'expression') {
        state.pop();
      }
      i++;
    }
    const finalState = state[state.length - 1];
    return { matched: true, state: finalState };
  }

  protected findValidMemoryVariables(params: TextDocumentPositionParams): CompletionItem[] | null {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return null;
    const position = params.position;
    const range = getRangeAtPosition(document, position);
    const wordAtCurRange = document.getText(range);

    if (!wordAtCurRange || !wordAtCurRange.endsWith('.')) {
      return null;
    }

    let propertyList = wordAtCurRange.split('.');
    propertyList = propertyList.slice(0, propertyList.length - 1);
    let tempVariable: object = this.memoryVariables;
    for (const property of propertyList) {
      if (property in tempVariable) {
        tempVariable = tempVariable[property];
      } else {
        tempVariable = {};
      }
    }

    if (Object.keys(tempVariable).length === 0) {
      return null;
    }

    if (tempVariable instanceof Array) {
      const completionList: CompletionItem[] = [];
      for (const variable of tempVariable) {
        Object.keys(variable).forEach(e => {
          const item = {
            label: e.toString(),
            kind: CompletionItemKind.Property,
            insertText: e.toString(),
            documentation: '',
          };
          completionList.push(item);
        });
      }

      return completionList;
    }

    return null;
  }

  protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const text = this.getLGDocumentContent(document);
    let templates: LGTemplate[] = [];

    const diags = checkText(text);

    if (isValid(diags) === false) {
      return Promise.resolve(null);
    }

    const lgResources = getLGResources(text);
    templates = lgResources.templates;

    const completionTemplateList: CompletionItem[] = templates.map(template => {
      return {
        label: template.name,
        kind: CompletionItemKind.Reference,
        insertText:
          template.parameters.length > 0 ? template.name + '(' + template.parameters.join(', ') + ')' : template.name,
        documentation: template.body,
      };
    });

    const completionFunctionList: CompletionItem[] = Array.from(buildInfunctionsMap).map(item => {
      const [key, value] = item;
      return {
        label: key,
        kind: CompletionItemKind.Function,
        insertText: key + '(' + this.removeParamFormat(value.Params.toString()) + ')',
        documentation: value.Introduction,
      };
    });

    const completionVariableList = this.findValidMemoryVariables(params);
    const completionRootVariableList = Object.keys(this.memoryVariables).map(e => {
      return {
        label: e.toString(),
        kind: CompletionItemKind.Property,
        insertText: e.toString(),
        documentation: '',
      };
    });

    let completionList = completionTemplateList.concat(completionFunctionList);
    completionList = completionList.concat(completionRootVariableList);

    const matchResult = this.matchedStates(params);

    if (
      matchResult &&
      matchResult.matched &&
      matchResult.state &&
      allowedCompletionStates.includes(matchResult.state.toLowerCase())
    ) {
      if (completionVariableList !== null && completionVariableList.length > 0) {
        return Promise.resolve({ isIncomplete: true, items: completionVariableList });
      } else {
        return Promise.resolve({ isIncomplete: true, items: completionList });
      }
    } else {
      return Promise.resolve(null);
    }
  }

  protected validate(document: TextDocument): void {
    this.cleanPendingValidation(document);
    this.pendingValidationRequests.set(
      document.uri,
      setTimeout(() => {
        this.pendingValidationRequests.delete(document.uri);
        this.doValidate(document);
      })
    );
  }

  protected cleanPendingValidation(document: TextDocument): void {
    const request = this.pendingValidationRequests.get(document.uri);
    if (typeof request !== 'undefined') {
      clearTimeout(request);
      this.pendingValidationRequests.delete(document.uri);
    }
  }

  protected doValidate(document: TextDocument): void {
    let text = document.getText();
    const LGDocument = this.getLGDocument(document);
    let lgDiagnostics: LGDiagnostic[] = [];
    let lineOffset = 0;

    // uninitialized
    if (!LGDocument) {
      return;
    }

    if (text.length === 0) {
      this.cleanDiagnostics(document);
      return;
    }

    // if inline editor, concat new content for validate
    if (LGDocument.inline) {
      const { content, template } = LGDocument;
      if (!content || !template) return;
      const updatedTemplate = {
        name: template.name,
        parameters: template.parameters,
        body: text,
      };

      const templateDiags = checkTemplate(updatedTemplate);
      // error in template.
      if (isValid(templateDiags) === false) {
        const diagnostics = convertDiagnostics(templateDiags, document);
        this.sendDiagnostics(document, diagnostics);
        return;
      }

      text = updateTemplateInContent(content, updatedTemplate);
      const templateRange: TRange = getTemplateRange(content, updatedTemplate);
      lineOffset = templateRange.startLineNumber;

      // filter diagnostics belong to this template.
      lgDiagnostics = checkText(text).filter(lgDialg => {
        return (
          lgDialg.range.start.line >= templateRange.startLineNumber &&
          lgDialg.range.end.line <= templateRange.endLineNumber
        );
      });
    } else {
      lgDiagnostics = checkText(text);
    }

    const diagnostics = convertDiagnostics(lgDiagnostics, document, lineOffset);
    this.sendDiagnostics(document, diagnostics);
  }

  protected cleanDiagnostics(document: TextDocument): void {
    this.sendDiagnostics(document, []);
  }

  protected sendDiagnostics(document: TextDocument, diagnostics: Diagnostic[]): void {
    this.connection.sendDiagnostics({
      uri: document.uri,
      diagnostics,
    });
  }
}
