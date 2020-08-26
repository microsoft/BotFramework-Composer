// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
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
import { filterTemplateDiagnostics, isValid, lgUtil } from '@bfc/indexers';
import { MemoryResolver, ResolverResource, LgFile, importResolverGenerator } from '@bfc/shared';
import { buildInFunctionsMap } from '@bfc/built-in-functions';

import { LgParser } from './lgParser';
import {
  getRangeAtPosition,
  LGDocument,
  convertDiagnostics,
  generageDiagnostic,
  LGOption,
  LGCursorState,
  cardTypes,
  cardPropDict,
  cardPropPossibleValueType,
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
  private _lgParser = new LgParser();

  constructor(
    protected readonly connection: IConnection,
    protected readonly getLgResources: (projectId?: string) => ResolverResource[],
    protected readonly memoryResolver?: MemoryResolver
  ) {
    this.documents.listen(this.connection);
    this.documents.onDidChangeContent((change) => this.validate(change.document));
    this.documents.onDidClose((event) => {
      this.cleanPendingValidation(event.document);
      this.cleanDiagnostics(event.document);
    });

    this.connection.onInitialize((params) => {
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
    this.connection.onCompletion(async (params) => await this.completion(params));
    this.connection.onHover(async (params) => await this.hover(params));
    this.connection.onDocumentOnTypeFormatting((docTypingParams) => this.docTypeFormat(docTypingParams));

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

    memoryFileInfo.forEach((variable) => {
      const propertyList = variable.split('.');
      if (propertyList.length >= 1) {
        this.updateObject(propertyList);
      }
    });
  }

  protected async validateLgOption(document: TextDocument, lgOption?: LGOption) {
    if (!lgOption) return;

    const diagnostics: string[] = [];

    if (!this.getLgResources) {
      diagnostics.push('[Error lgOption] getLgResources is required but not exist.');
    }
    this.connection.console.log(diagnostics.join('\n'));
    this.sendDiagnostics(
      document,
      diagnostics.map((errorMsg) => generageDiagnostic(errorMsg, DiagnosticSeverity.Error, document))
    );
  }

  protected addLGDocument(document: TextDocument, lgOption?: LGOption) {
    const { uri } = document;
    const { fileId, templateId, projectId } = lgOption || {};
    const index = (): LgFile => {
      const content = this.documents.get(uri)?.getText() || '';
      // if inline mode, composite local with server resolved file.
      const lgTextFiles = projectId ? this.getLgResources(projectId) : [];
      if (fileId && templateId) {
        const lgTextFile = lgTextFiles.find((item) => item.id === fileId);
        if (lgTextFile) {
          const lgFile = lgUtil.parse(lgTextFile.id, lgTextFile.content, lgTextFiles);
          const lgResolver = importResolverGenerator(lgTextFiles, '.lg');
          return lgUtil.updateTemplate(lgFile, templateId, { body: content }, lgResolver);
        }
      }

      return lgUtil.parse(fileId || uri, content, lgTextFiles);
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

  protected async hover(params: TextDocumentPositionParams): Promise<Thenable<Hover | null>> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const lgFile = this.getLGDocument(document)?.index();
    if (!lgFile) {
      return Promise.resolve(null);
    }
    const { allTemplates, diagnostics } = lgFile;
    if (diagnostics.length) {
      return Promise.resolve(null);
    }
    const wordRange = getRangeAtPosition(document, params.position);
    let word = document.getText(wordRange);
    const matchItem = allTemplates.find((u) => u.name === word);
    if (matchItem) {
      const hoveritem: Hover = { contents: [matchItem.body] };
      return Promise.resolve(hoveritem);
    }
    if (word.startsWith('builtin.')) {
      word = word.substring(8);
    }

    if (buildInFunctionsMap.has(word)) {
      const functionEntity = buildInFunctionsMap.get(word);
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

  private removeParamFormat(params: string): string {
    const resultArr = params.split(',').map((element) => {
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
    const keyValueRegex = /.+=.+/;
    let cardName = '';
    for (const line of lines) {
      if (line.trim().startsWith('#')) {
        state.push(TEMPLATENAME);
      } else if (line.trim().startsWith('-')) {
        state.push(TEMPLATEBODY);
      } else if ((state[state.length - 1] === TEMPLATENAME || templateId) && line.trim().startsWith('[')) {
        state.push(STRUCTURELG);
        cardName = line.trim().substring(1);
      } else if (state[state.length - 1] === STRUCTURELG && (line.trim() === '' || keyValueRegex.test(line))) {
        state.push(STRUCTURELG);
      } else {
        state.push(ROOT);
      }
    }

    if (state[state.length - 1] === STRUCTURELG) {
      return cardName;
    }

    return undefined;
  }

  private findLastStructureLGProps(
    params: TextDocumentPositionParams,
    templateId: string | undefined
  ): string[] | undefined {
    const state: LGCursorState[] = [];
    const document = this.documents.get(params.textDocument.uri);
    if (!document) return;
    const position = params.position;
    const range = Range.create(0, 0, position.line, position.character);
    const lines = document.getText(range).split('\n');
    const keyValueRegex = /.+=.+/;
    let props: string[] = [];
    for (const line of lines) {
      if (line.trim().startsWith('#')) {
        state.push(TEMPLATENAME);
      } else if (line.trim().startsWith('-')) {
        state.push(TEMPLATEBODY);
      } else if ((state[state.length - 1] === TEMPLATENAME || templateId) && line.trim().startsWith('[')) {
        state.push(STRUCTURELG);
        props = [];
      } else if (state[state.length - 1] === STRUCTURELG && (line.trim() === '' || keyValueRegex.test(line))) {
        state.push(STRUCTURELG);
        props.push(line.split('=')[0].trim());
      } else {
        state.push(ROOT);
      }
    }

    if (state[state.length - 1] === STRUCTURELG) {
      return props;
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

      Object.keys(tempVariable).forEach((e) => {
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
    const memoryVariblesRootCompletionList = Object.keys(this.memoryVariables).map((e) => {
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

  protected async completion(params: TextDocumentPositionParams): Promise<Thenable<CompletionList | null>> {
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
    const lines = document.getText(range).split('\n');
    if (!lgFile) {
      return Promise.resolve(null);
    }

    const { allTemplates } = lgFile;
    const completionTemplateList: CompletionItem[] = allTemplates.map((template) => {
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

    const completionFunctionList: CompletionItem[] = Array.from(buildInFunctionsMap).map((item) => {
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
      const cardTypesSuggestions: CompletionItem[] = cardTypes.map((type) => {
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
    const propsList = this.findLastStructureLGProps(params, templateId);
    const cardNameRegex = /^\s*\[[\w]+/;
    const lastLine = lines[lines.length - 2];
    const paddingIndent = cardNameRegex.test(lastLine) ? '\t' : '';
    const normalCardTypes = ['CardAction', 'Suggestions', 'Attachment'];
    if (cardType && cardTypes.includes(cardType)) {
      const items: CompletionItem[] = [];
      if (normalCardTypes.includes(cardType)) {
        cardPropDict[cardType].forEach((u) => {
          if (!propsList?.includes(u)) {
            const item = {
              label: `${u}: ${cardPropPossibleValueType[u]}`,
              kind: CompletionItemKind.Snippet,
              insertText: `${paddingIndent}${u} = ${cardPropPossibleValueType[u]}`,
              documentation: `Suggested propertiy ${u} in ${cardType}`,
            };
            items.push(item);
          }
        });
      } else if (cardType.endsWith('Card')) {
        cardPropDict.Cards.forEach((u) => {
          if (!propsList?.includes(u)) {
            const item = {
              label: `${u}: ${cardPropPossibleValueType[u]}`,
              kind: CompletionItemKind.Snippet,
              insertText: `${paddingIndent}${u} = ${cardPropPossibleValueType[u]}`,
              documentation: `Suggested propertiy ${u} in ${cardType}`,
            };
            items.push(item);
          }
        });
      } else {
        cardPropDict.Others.forEach((u) => {
          if (!propsList?.includes(u)) {
            const item = {
              label: `${u}: ${cardPropPossibleValueType[u]}`,
              kind: CompletionItemKind.Snippet,
              insertText: `${paddingIndent}${u} = ${cardPropPossibleValueType[u]}`,
              documentation: `Suggested propertiy ${u} in ${cardType}`,
            };
            items.push(item);
          }
        });
      }

      if (items.length > 0) {
        return Promise.resolve({
          isIncomplete: true,
          items: items,
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
    const lgDoc = this.getLGDocument(document);
    const templateId = lgDoc?.templateId;
    const cardType = this.matchCardTypeState(params, templateId);
    const propsList = this.findLastStructureLGProps(params, templateId);
    const normalCardTypes = ['CardAction', 'Suggestions', 'Attachment'];
    let expectedPropsList: string[] = [];
    let matchedAllProps = false;
    if (cardType) {
      if (normalCardTypes.includes(cardType)) {
        expectedPropsList = cardPropDict[cardType];
      } else if (cardType.endsWith('Card')) {
        expectedPropsList = cardPropDict.Cards;
      } else {
        expectedPropsList = cardPropDict.Others;
      }
    }

    if (expectedPropsList.length > 0 && propsList !== undefined && this.isSubList(expectedPropsList, propsList)) {
      matchedAllProps = true;
    }
    if (key === '\n' && isInStructureLGMode && matchedAllProps) {
      const length = templateId ? 4 : 2;
      const deleteRange = Range.create(position.line, 0, position.line, length);
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

  private isSubList(list1: string[], list2: string[]): boolean {
    for (const item of list1) {
      if (!list2.includes(item)) {
        return false;
      }
    }

    return true;
  }

  protected validate(document: TextDocument): void {
    this.cleanPendingValidation(document);
    this.pendingValidationRequests.set(
      document.uri,
      setTimeout(async () => {
        this.pendingValidationRequests.delete(document.uri);
        await this.doValidate(document);
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

  protected async doValidate(document: TextDocument): Promise<void> {
    const text = document.getText();
    const lgDoc = this.getLGDocument(document);
    if (!lgDoc) {
      return;
    }
    const { fileId, templateId, uri, projectId } = lgDoc;
    const lgFile = lgDoc.index();
    if (!lgFile) {
      return;
    }

    if (text.length === 0) {
      this.cleanDiagnostics(document);
      return;
    }

    // if inline editor, concat new content for validate
    if (fileId && templateId) {
      const templateDiags = lgUtil
        .checkTemplate({
          name: templateId,
          parameters: [],
          body: text,
        })
        .filter((diagnostic) => {
          // ignore non-exist references in template body.
          return diagnostic.message.includes('does not have an evaluator') === false;
        });
      // error in template.
      if (isValid(templateDiags) === false) {
        const lspDiagnostics = convertDiagnostics(templateDiags, document, 1);
        this.sendDiagnostics(document, lspDiagnostics);
        return;
      }

      // filter diagnostics belong to this template.
      const lgDiagnostics = filterTemplateDiagnostics(lgFile, templateId);
      const lspDiagnostics = convertDiagnostics(lgDiagnostics, document);
      this.sendDiagnostics(document, lspDiagnostics);
      return;
    }
    let lgDiagnostics: any[] = [];
    try {
      const payload = await this._lgParser.parseText(
        text,
        fileId || uri,
        projectId ? this.getLgResources(projectId) : []
      );
      lgDiagnostics = payload.diagnostics;
    } catch (error) {
      lgDiagnostics.push(generageDiagnostic(error.message, DiagnosticSeverity.Error, document));
    }
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
