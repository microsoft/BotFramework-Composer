// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { readFile } from 'fs';

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
import { LgFile, lgIndexer } from '@bfc/indexers';

import { buildInfunctionsMap } from './builtinFunctionsMap';
import {
  getRangeAtPosition,
  getLGResources,
  updateTemplateInContent,
  LGDocument,
  checkText,
  checkTemplate,
  convertDiagnostics,
  isValid,
  LGOption,
} from './utils';

// define init methods call from client
const InitializeDocumentsMethodName = 'initializeDocuments';

const allowedCompletionStates = ['expression'];

const { parse } = lgIndexer;

export class LGServer {
  protected workspaceRoot?: URI;
  protected readonly documents = new TextDocuments();
  protected readonly pendingValidationRequests = new Map<string, number>();
  protected LGDocuments: LGDocument[] = []; // LG Documents Store
  protected lgFiles: LgFile[] = [];

  constructor(protected readonly connection: IConnection, protected readonly botProjectService) {
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
          },
          hoverProvider: true,
          foldingRangeProvider: false,
        },
      };
    });
    this.connection.onCompletion(params => this.completion(params));
    this.connection.onHover(params => this.hover(params));

    this.connection.onRequest(async (method, params) => {
      if (InitializeDocumentsMethodName === method) {
        const currentProject = this.botProjectService.getCurrentBotProject();
        if (currentProject !== undefined && (await currentProject.exists())) {
          await currentProject.index();
          const { lgFiles } = currentProject.getIndexes();
          this.lgFiles = lgFiles;
        }
        const { uri, lgOption }: { uri: string; lgOption: LGOption } = params;
        this.LGDocuments.push({ uri, lgOption });
        // run diagnostic
        const textDocument = this.documents.get(uri);
        if (textDocument) {
          this.validate(textDocument);
        }
      }
    });
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
    if (LGDocument && LGDocument.lgOption) {
      const { fileId, templateId } = LGDocument.lgOption;
      const lgFile = this.lgFiles.find(({ id }) => id === fileId);
      if (!lgFile) return text;
      const { content, templates } = lgFile;

      const template = templates.find(({ name }) => name === templateId);
      if (!template) return text;
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

    const completionList = completionTemplateList.concat(completionFunctionList);

    const matchResult = this.matchedStates(params);
    // TODO: more precise match
    if (
      matchResult &&
      matchResult.matched &&
      matchResult.state &&
      allowedCompletionStates.includes(matchResult.state.toLowerCase())
    ) {
      return Promise.resolve({ isIncomplete: true, items: completionList });
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
    const text = document.getText();
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
    const { lgOption } = LGDocument;
    if (lgOption) {
      const { templateId, fileId } = lgOption;
      const templateDiags = checkTemplate({
        name: templateId,
        parameters: [],
        body: text,
      });
      // error in template.
      if (isValid(templateDiags) === false) {
        const diagnostics = convertDiagnostics(templateDiags, document);
        this.sendDiagnostics(document, diagnostics);
        return;
      }

      const fullText = this.getLGDocumentContent(document);
      const template = parse(fullText, fileId).find(({ name }) => name === templateId);
      if (!template) return;
      lineOffset = template.range.startLineNumber;

      // filter diagnostics belong to this template.
      lgDiagnostics = checkText(fullText).filter(lgDialg => {
        return (
          lgDialg.range &&
          template.range &&
          lgDialg.range.start.line >= template.range.startLineNumber &&
          lgDialg.range.end.line <= template.range.endLineNumber
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
