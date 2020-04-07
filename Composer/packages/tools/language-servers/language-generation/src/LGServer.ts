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
  DiagnosticSeverity,
  TextEdit,
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams, DocumentOnTypeFormattingParams } from 'vscode-languageserver-protocol';
import get from 'lodash/get';
import { filterTemplateDiagnostics, isValid } from '@bfc/indexers';
import { MemoryResolver } from '@bfc/shared';
import { ImportResolverDelegate, Templates } from 'botbuilder-lg';

import { buildInfunctionsMap } from './builtinFunctionsMap';
import {
  getRangeAtPosition,
  LGDocument,
  checkTemplate,
  convertDiagnostics,
  generageDiagnostic,
  LGOption,
  LGCursorState,
  updateTemplate,
  cardTypes,
  cardPropDict,
} from './utils';

// define init methods call from client
const InitializeDocumentsMethodName = 'initializeDocuments';

const { ROOT, TEMPLATENAME, TEMPLATEBODY, EXPRESSION, COMMENTS, SINGLE, DOUBLE, STRUCTURELG } = LGCursorState;

export class LGServer {
  protected workspaceRoot?: URI;
  protected readonly documents = new TextDocuments();
  protected readonly pendingValidationRequests = new Map<string, number>();
  protected LGDocuments: LGDocument[] = [];
  private memoryVariables: Record<string, any> = {};

  constructor(
    protected readonly connection: IConnection,
    protected readonly importResolver?: (
      source: string,
      resourceId: string,
      projectId: string
    ) => {
      content: string;
      id: string;
    },
    protected readonly memoryResolver?: MemoryResolver
  ) {
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
            triggerCharacters: ['.', '[', '[', '\n'],
          },
          hoverProvider: true,
          foldingRangeProvider: false,
          documentOnTypeFormattingProvider: {
            firstTriggerCharacter: '\n',
          },
        },
      };
    });
    this.connection.onCompletion(params => this.completion(params));
    this.connection.onHover(params => this.hover(params));
    this.connection.onDocumentOnTypeFormatting(docTypingParams => this.docTypeFormat(docTypingParams));

    this.connection.onRequest((method, params) => {
      if (InitializeDocumentsMethodName === method) {
        const { uri, lgOption }: { uri: string; lgOption?: LGOption } = params;
        const textDocument = this.documents.get(uri);
        if (textDocument) {
          this.addLGDocument(textDocument, lgOption);
          this.validateLgOption(textDocument, lgOption);
          this.validate(textDocument);
        }
      }
    });
  }

  start() {
    this.connection.listen();
  }

  protected updateObject(propertyList: string[]): void {
    let tempVariable: Record<string, any> = this.memoryVariables;
    const antPattern = /\*+/;
    const normalizedAnyPattern = '***';
    for (let property of propertyList) {
      if (property in tempVariable) {
        tempVariable = tempVariable[property];
      } else {
        if (antPattern.test(property)) {
          property = normalizedAnyPattern;
        }
        tempVariable[property] = {};
        tempVariable = tempVariable[property];
      }
    }
  }

  protected updateMemoryVariables(uri: string): void {
    if (!this.memoryResolver) {
      return;
    }

    const document = this.documents.get(uri);
    if (!document) return;
    const projectId = this.getLGDocument(document)?.projectId;
    if (!projectId) return;
    const memoryFileInfo: string[] | undefined = this.memoryResolver(projectId);
    if (!memoryFileInfo || memoryFileInfo.length === 0) {
      return;
    }

    memoryFileInfo.forEach(variable => {
      const propertyList = variable.split('.');
      if (propertyList.length >= 1) {
        this.updateObject(propertyList);
      }
    });
  }

  protected validateLgOption(document: TextDocument, lgOption?: LGOption) {
    if (!lgOption) return;

    const diagnostics: string[] = [];

    if (!this.importResolver) {
      diagnostics.push('[Error lgOption] importResolver is required but not exist.');
    } else {
      const { fileId, templateId } = lgOption;
      const lgFile = this.getLGDocument(document)?.index();
      if (!lgFile) {
        diagnostics.push(`[Error lgOption] File ${fileId}.lg do not exist`);
      } else if (templateId) {
        const { templates } = lgFile;
        const template = templates.find(({ name }) => name === templateId);
        if (!template) diagnostics.push(`Template ${fileId}.lg#${templateId} do not exist`);
      }
    }
    this.connection.console.log(diagnostics.join('\n'));
    this.sendDiagnostics(
      document,
      diagnostics.map(errorMsg => generageDiagnostic(errorMsg, DiagnosticSeverity.Error, document))
    );
  }

  protected getImportResolver(document: TextDocument) {
    const editorContent = document.getText();
    const internalImportResolver = () => {
      return {
        id: document.uri,
        content: editorContent,
      };
    };
    const { fileId, templateId, projectId } = this.getLGDocument(document) || {};

    if (this.importResolver && fileId && projectId) {
      const resolver = this.importResolver;
      return (source: string, id: string) => {
        const lgFile = resolver(source, id, projectId);
        if (!lgFile) {
          this.sendDiagnostics(document, [
            generageDiagnostic(`lg file: ${fileId}.lg not exist on server`, DiagnosticSeverity.Error, document),
          ]);
        }
        let { content } = lgFile;
        /**
         * source is . means use as file resolver, not import resolver
         * if inline editor, server file write may have delay than webSocket updated LSP server
         * so here build the full content from server file content and editor content
         */
        if (source === '.' && templateId) {
          content = updateTemplate(lgFile.content, templateId, editorContent);
        }
        return { id, content };
      };
    }

    return internalImportResolver;
  }

  protected addLGDocument(document: TextDocument, lgOption?: LGOption) {
    const { uri } = document;
    const { fileId, templateId, projectId } = lgOption || {};
    const index = () => {
      const importResolver: ImportResolverDelegate = this.getImportResolver(document);
      let content: string = document.getText();
      // if inline mode, composite local with server resolved file.
      if (this.importResolver && fileId && templateId) {
        try {
          content = importResolver('.', `${fileId}.lg`).content;
        } catch (error) {
          // ignore if file not exist
        }
      }

      const id = fileId || uri;
      const { allTemplates, diagnostics } = Templates.parseText(content, id, importResolver);

      return { templates: allTemplates, diagnostics };
    };
    const lgDocument: LGDocument = {
      uri,
      projectId,
      fileId,
      templateId,
      index,
    };
    this.LGDocuments.push(lgDocument);
  }

  protected getLGDocument(document: TextDocument): LGDocument | undefined {
    return this.LGDocuments.find(({ uri }) => uri === document.uri);
  }

  protected hover(params: TextDocumentPositionParams): Thenable<Hover | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const lgFile = this.getLGDocument(document)?.index();
    if (!lgFile) {
      return Promise.resolve(null);
    }
    const { templates, diagnostics } = lgFile;
    if (diagnostics.length) {
      return Promise.resolve(null);
    }
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

  private matchLineState(
    params: TextDocumentPositionParams,
    templateId: string | undefined
  ): LGCursorState | undefined {
    const state: LGCursorState[] = [];
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return;
    const position = params.position;
    const range = Range.create(0, 0, position.line, position.character);
    const lines = document.getText(range).split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('#')) {
        state.push(TEMPLATENAME);
      } else if (line.trim().startsWith('-')) {
        state.push(TEMPLATEBODY);
      } else if (
        (state[state.length - 1] === TEMPLATENAME || templateId) &&
        (line.trim() === '[' || line.trim() === '[]')
      ) {
        state.push(STRUCTURELG);
      }
    }

    return state.length >= 1 ? state.pop() : undefined;
  }

  private matchCardTypeState(params: TextDocumentPositionParams, templateId: string | undefined): string | undefined {
    const state: LGCursorState[] = [];
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return;
    const position = params.position;
    const range = Range.create(0, 0, position.line, position.character);
    const lines = document.getText(range).split('\n');
    let lastLine = '';
    for (const line of lines) {
      if (line.trim().startsWith('#')) {
        state.push(TEMPLATENAME);
      } else if (line.trim().startsWith('-')) {
        state.push(TEMPLATEBODY);
      } else if ((state[state.length - 1] === TEMPLATENAME || templateId) && line.trim().startsWith('[')) {
        state.push(STRUCTURELG);
        lastLine = line;
      } else if (state[state.length - 1] === STRUCTURELG && line.trim() === '') {
        return lastLine.trim().substring(1);
      } else {
        state.push(ROOT);
      }
    }

    return undefined;
  }

  private matchState(params: TextDocumentPositionParams): LGCursorState | undefined {
    const state: LGCursorState[] = [];
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return;
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const lineContent = document.getText(range);

    //initialize the root state to plaintext
    state.push(ROOT);
    if (lineContent.trim().startsWith('#')) {
      return TEMPLATENAME;
    } else if (lineContent.trim().startsWith('>')) {
      return COMMENTS;
    } else if (lineContent.trim().startsWith('-')) {
      state.push(TEMPLATEBODY);
    } else {
      return ROOT;
    }

    // find out the context state of current cursor, offer precise suggestion and completion etc.
    /**
     * > To learn more about the LG file format...       --- COMMENTS
     * # Greeting                                        --- TEMPLATENAME
     * - Hello                                           --- TEMPLATEBODY
     * - Hi, @{name}, what's the meaning of 'state'
     *          |
     *          +------------------------------------------- EXPRESSION
     */
    let i = 0;
    while (i < lineContent.length) {
      const char = lineContent.charAt(i);
      if (char === `'`) {
        if (state[state.length - 1] === EXPRESSION || state[state.length - 1] === DOUBLE) {
          state.push(SINGLE);
        } else {
          state.pop();
        }
      }

      if (char === `"`) {
        if (state[state.length - 1] === EXPRESSION || state[state.length - 1] === SINGLE) {
          state.push(DOUBLE);
        } else {
          state.pop();
        }
      }

      if (char === '{' && i >= 1 && state[state.length - 1] !== SINGLE && state[state.length - 1] !== DOUBLE) {
        if (lineContent.charAt(i - 1) === '$') {
          state.push(EXPRESSION);
        }
      }

      if (char === '}' && state[state.length - 1] === EXPRESSION) {
        state.pop();
      }
      i++;
    }
    return state.pop();
  }

  protected matchingCompletionProperty(propertyList: string[], ...objects: object[]): CompletionItem[] {
    const completionList: CompletionItem[] = [];
    const normalizedAnyPattern = '***';
    for (const obj of objects) {
      let tempVariable = obj;
      for (const property of propertyList) {
        if (property in tempVariable) {
          tempVariable = tempVariable[property];
        } else if (normalizedAnyPattern in tempVariable) {
          tempVariable = tempVariable[normalizedAnyPattern];
        } else {
          tempVariable = {};
        }
      }

      if (!tempVariable || Object.keys(tempVariable).length === 0) {
        continue;
      }

      Object.keys(tempVariable).forEach(e => {
        if (e.toString() !== normalizedAnyPattern) {
          const item = {
            label: e.toString(),
            kind: CompletionItemKind.Property,
            insertText: e.toString(),
            documentation: '',
          };
          if (!completionList.includes(item)) {
            completionList.push(item);
          }
        }
      });
    }

    return completionList;
  }

  protected findValidMemoryVariables(params: TextDocumentPositionParams): CompletionItem[] {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return [];
    const position = params.position;
    const range = getRangeAtPosition(document, position);
    const wordAtCurRange = document.getText(range);
    const endWithDot = wordAtCurRange.endsWith('.');

    this.updateMemoryVariables(params.textDocument.uri);
    const memoryVariblesRootCompletionList = Object.keys(this.memoryVariables).map(e => {
      return {
        label: e.toString(),
        kind: CompletionItemKind.Property,
        insertText: e.toString(),
        documentation: '',
      };
    });

    if (!wordAtCurRange || !endWithDot) {
      return memoryVariblesRootCompletionList;
    }

    let propertyList = wordAtCurRange.split('.');
    propertyList = propertyList.slice(0, propertyList.length - 1);

    const completionList = this.matchingCompletionProperty(propertyList, this.memoryVariables);

    return completionList;
  }

  protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const position = params.position;
    const range = getRangeAtPosition(document, position);
    const wordAtCurRange = document.getText(range);
    const endWithDot = wordAtCurRange.endsWith('.');
    const lgDoc = this.getLGDocument(document);
    const lgFile = lgDoc?.index();
    const templateId = lgDoc?.templateId;
    if (!lgFile) {
      return Promise.resolve(null);
    }

    const { templates } = lgFile;
    const completionTemplateList: CompletionItem[] = templates.map(template => {
      return {
        label: template.name,
        kind: CompletionItemKind.Reference,
        insertText:
          template.parameters.length > 0
            ? template.name + '(' + template.parameters.join(', ') + ')'
            : template.name + '()',
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

    const completionPropertyResult = this.findValidMemoryVariables(params);

    const curLineState = this.matchLineState(params, templateId);

    if (curLineState === STRUCTURELG) {
      const cardTypesSuggestions: CompletionItem[] = cardTypes.map(type => {
        return {
          label: type,
          kind: CompletionItemKind.Keyword,
          insertText: type,
          documentation: `Suggestion for Card or Activity: ${type}`,
        };
      });

      return Promise.resolve({
        isIncomplete: true,
        items: cardTypesSuggestions,
      });
    }

    const cardType = this.matchCardTypeState(params, templateId);
    if (cardType && cardTypes.includes(cardType)) {
      let item: CompletionItem | undefined = undefined;
      if (cardType === 'CardAction') {
        let insertStr = '';
        insertStr = cardPropDict[cardType].map(u => `\t${u} = `).join('\r\n');
        item = {
          label: `Properties for ${cardType}`,
          kind: CompletionItemKind.Keyword,
          insertText: insertStr,
          documentation: `Suggested properties for Card: ${cardType}`,
        };
      } else if (cardType === 'Suggestions') {
        let insertStr = '';
        insertStr = cardPropDict[cardType].map(u => `\t${u} = `).join('\r\n');
        item = {
          label: `Properties for ${cardType}`,
          kind: CompletionItemKind.Keyword,
          insertText: insertStr,
          documentation: `Suggested properties for Card: ${cardType}`,
        };
      } else if (cardType === 'Attachment') {
        let insertStr = '';
        insertStr = cardPropDict[cardType].map(u => `\t${u} = `).join('\r\n');
        item = {
          label: `Properties for ${cardType}`,
          kind: CompletionItemKind.Keyword,
          insertText: insertStr,
          documentation: `Suggested properties for Card: ${cardType}`,
        };
      } else if (cardType.endsWith('Card')) {
        let insertStr = '';
        insertStr = cardPropDict.Cards.map(u => `\t${u} = `).join('\r\n');
        item = {
          label: `Properties for ${cardType}`,
          kind: CompletionItemKind.Keyword,
          insertText: insertStr,
          documentation: `Suggested properties for Card: ${cardType}`,
        };
      } else {
        let insertStr = '';
        insertStr = cardPropDict.Others.map(u => `\t${u} = `).join('\r\n');
        item = {
          label: `Properties for ${cardType}`,
          kind: CompletionItemKind.Keyword,
          insertText: insertStr,
          documentation: `Suggested properties for Card: ${cardType}`,
        };
      }

      if (item) {
        return Promise.resolve({
          isIncomplete: true,
          items: [item],
        });
      }
    }

    const matchedState = this.matchState(params);
    if (matchedState === EXPRESSION) {
      if (endWithDot) {
        return Promise.resolve({
          isIncomplete: true,
          items: completionPropertyResult,
        });
      } else {
        return Promise.resolve({
          isIncomplete: true,
          items: completionTemplateList.concat(completionFunctionList.concat(completionPropertyResult)),
        });
      }
    } else {
      return Promise.resolve(null);
    }
  }

  protected async docTypeFormat(params: DocumentOnTypeFormattingParams): Promise<TextEdit[] | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }

    const edits: TextEdit[] = [];
    const key = params.ch;
    const position = params.position;
    const range = Range.create(0, 0, position.line, position.character);
    const lines = document.getText(range).split('\n');
    const isInStructureLGMode = this.matchStructureLG(lines);
    if (key === '\n' && isInStructureLGMode) {
      const deleteRange = Range.create(position.line, 0, position.line, 4);
      const deleteItem: TextEdit = TextEdit.del(deleteRange);
      if (document.getText(deleteRange).trim() === '') {
        edits.push(deleteItem);
      }
    }

    return Promise.resolve(edits);
  }

  private matchStructureLG(lines: string[]): boolean {
    if (lines.length === 0) return false;
    let state = ROOT;
    const propertyDefinitionRegex = /[^=]+=.*/;
    for (const line of lines) {
      if (state === ROOT && line.trim().startsWith('[')) {
        state = STRUCTURELG;
      } else if ((state === STRUCTURELG && propertyDefinitionRegex.test(line)) || line.trim() === '') {
        continue;
      } else {
        state = ROOT;
      }
    }

    if (state === ROOT) {
      return false;
    }

    return true;
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
    const lgDoc = this.getLGDocument(document);
    if (!lgDoc) {
      return;
    }
    const { fileId, templateId, uri } = lgDoc;
    const lgFile = lgDoc.index();
    if (!lgFile) {
      return;
    }

    if (text.length === 0) {
      this.cleanDiagnostics(document);
      return;
    }

    const { templates, diagnostics } = lgFile;

    // if inline editor, concat new content for validate
    if (fileId && templateId) {
      const templateDiags = checkTemplate({
        name: templateId,
        parameters: [],
        body: text,
      });
      // error in template.
      if (isValid(templateDiags) === false) {
        const lspDiagnostics = convertDiagnostics(templateDiags, document, 1);
        this.sendDiagnostics(document, lspDiagnostics);
        return;
      }
      const template = templates.find(({ name }) => name === templateId);
      if (!template) return;

      // filter diagnostics belong to this template.
      const lgDiagnostics = filterTemplateDiagnostics(diagnostics, template);
      const lspDiagnostics = convertDiagnostics(lgDiagnostics, document, 1);
      this.sendDiagnostics(document, lspDiagnostics);
      return;
    }
    const lgDiagnostics = Templates.parseText(text, fileId || uri, this.getImportResolver(document)).diagnostics;
    const lspDiagnostics = convertDiagnostics(lgDiagnostics, document);
    this.sendDiagnostics(document, lspDiagnostics);
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
