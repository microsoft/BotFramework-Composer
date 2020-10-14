// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import URI from 'vscode-uri';
import { IConnection, TextDocuments } from 'vscode-languageserver';
import {
  TextDocument,
  Diagnostic,
  CompletionList,
  Position,
  CompletionItem,
  CompletionItemKind,
  Range,
  DiagnosticSeverity,
  TextEdit,
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams, DocumentOnTypeFormattingParams } from 'vscode-languageserver-protocol';
import { updateIntent, isValid, checkSection, PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import { luIndexer } from '@bfc/indexers';
import { parser } from '@microsoft/bf-lu/lib/parser';

import { EntityTypesObj, LineState } from './entityEnum';
import * as util from './matchingPattern';
import { ImportResolverDelegate, LUOption, LUDocument, generageDiagnostic, convertDiagnostics } from './utils';

// define init methods call from client
const LABELEXPERIENCEREQUEST = 'labelingExperienceRequest';
const InitializeDocumentsMethodName = 'initializeDocuments';

const { parse } = luIndexer;
const { parseFile } = parser;

export class LUServer {
  protected workspaceRoot: URI | undefined;
  protected readonly documents = new TextDocuments();
  protected readonly pendingValidationRequests = new Map<string, number>();
  protected LUDocuments: LUDocument[] = [];

  constructor(
    protected readonly connection: IConnection,
    protected readonly importResolver?: (
      source: string,
      resourceId: string,
      projectId: string
    ) => {
      content: string;
      id: string;
    }
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
            triggerCharacters: ['@', ' ', '{', ':', '[', '('],
          },
          foldingRangeProvider: false,
          documentOnTypeFormattingProvider: {
            firstTriggerCharacter: '\n',
          },
        },
      };
    });
    this.connection.onCompletion((params) => this.completion(params));
    this.connection.onDocumentOnTypeFormatting((docTypingParams) => this.docTypeFormat(docTypingParams));
    this.connection.onRequest((method, params) => {
      if (method === LABELEXPERIENCEREQUEST) {
        this.labelingExperienceHandler(params);
      } else if (InitializeDocumentsMethodName === method) {
        const { uri, luOption }: { uri: string; luOption?: LUOption } = params;
        const textDocument = this.documents.get(uri);
        if (textDocument) {
          this.addLUDocument(textDocument, luOption);
          this.validateLuOption(textDocument, luOption);
          this.validate(textDocument);
        }
      }
    });
  }

  start() {
    this.connection.listen();
  }

  protected validateLuOption(document: TextDocument, luOption?: LUOption) {
    if (!luOption) return;

    const diagnostics: string[] = [];

    if (!this.importResolver) {
      diagnostics.push('[Error luOption] importResolver is required but not exist.');
    } else {
      const { fileId, sectionId } = luOption;
      const luFile = this.getLUDocument(document)?.index();
      if (!luFile) {
        diagnostics.push(`[Error luOption] File ${fileId}.lu do not exist`);
      } else if (sectionId && sectionId !== PlaceHolderSectionName) {
        const { sections } = luFile;
        const section = sections.find(({ Name }) => Name === sectionId);
        if (!section) diagnostics.push(`Section ${fileId}.lu#${sectionId} do not exist`);
      }
    }
    this.connection.console.log(diagnostics.join('\n'));
    this.sendDiagnostics(
      document,
      diagnostics.map((errorMsg) => generageDiagnostic(errorMsg, DiagnosticSeverity.Error, document))
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
    const { fileId, sectionId, projectId, luFeatures } = this.getLUDocument(document) || {};

    if (this.importResolver && fileId && projectId) {
      const resolver = this.importResolver;
      return (source: string, id: string) => {
        const plainLuFile = resolver(source, id, projectId);
        if (!plainLuFile) {
          this.sendDiagnostics(document, [
            generageDiagnostic(`lu file: ${fileId}.lu not exist on server`, DiagnosticSeverity.Error, document),
          ]);
        }
        const luFile = luIndexer.parse(plainLuFile.content, plainLuFile.id, luFeatures);
        let { content } = luFile;
        /**
         * source is . means use as file resolver, not import resolver
         * if inline editor, server file write may have delay than webSocket updated LSP server
         * so here build the full content from server file content and editor content
         */
        if (source === '.' && sectionId) {
          content = updateIntent(luFile, sectionId, { Name: sectionId, Body: editorContent }, luFeatures).content;
        }
        return { id, content };
      };
    }

    return internalImportResolver;
  }

  protected addLUDocument(document: TextDocument, luOption?: LUOption) {
    const { uri } = document;
    const { fileId, sectionId, projectId, luFeatures = {} } = luOption || {};
    const index = () => {
      const importResolver: ImportResolverDelegate = this.getImportResolver(document);
      let content: string = document.getText();
      // if inline mode, composite local with server resolved file.
      if (this.importResolver && fileId && sectionId) {
        try {
          content = importResolver('.', `${fileId}.lu`).content;
        } catch (error) {
          // ignore if file not exist
        }
      }

      const id = fileId || uri;
      const { intents: sections, diagnostics } = parse(content, id, luFeatures);

      return { sections, diagnostics, content };
    };
    const luDocument: LUDocument = {
      uri,
      projectId,
      fileId,
      sectionId,
      luFeatures,
      index,
    };
    this.LUDocuments.push(luDocument);
  }

  protected getLUDocument(document: TextDocument): LUDocument | undefined {
    return this.LUDocuments.find(({ uri }) => uri === document.uri);
  }

  protected labelingExperienceHandler(params: any): void {
    const document: TextDocument | undefined = this.documents.get(params.uri);
    if (!document) {
      return;
    }
    const position = params.position;
    const range = Range.create(position.lineNumber - 1, 0, position.lineNumber - 1, position.column);
    const curLineContent = document.getText(range);
    // eslint-disable-next-line security/detect-unsafe-regex
    const labeledUtterRegex = /^\s*-([^{}]*\s*\{[\w.@:\s]+\s*=\s*[\w.\s]+\}[^{}]*)+$/;
    if (labeledUtterRegex.test(curLineContent)) {
      const newText = util.removeLabelsInUtterance(curLineContent);
      const newPos = Position.create(position.lineNumber, 0);
      const newUnlalbelText = newText + '\n';
      const editPreviousLine: TextEdit = TextEdit.insert(newPos, newUnlalbelText);
      const newPos2 = Position.create(position.lineNumber, curLineContent.length + 1);
      const editNextLine: TextEdit = TextEdit.insert(newPos2, '\n' + newUnlalbelText);
      const edits: TextEdit[] = [editPreviousLine, editNextLine];
      this.connection.sendNotification('addUnlabelUtterance', { edits: edits });
    }
  }

  protected async docTypeFormat(params: DocumentOnTypeFormattingParams): Promise<TextEdit[] | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }

    const lastLineContent = this.getLastLineContent(params);
    const edits: TextEdit[] = [];
    const curLineNumber = params.position.line;
    const luDoc = this.getLUDocument(document);
    const text = luDoc?.index().content || document.getText();
    const lines = text.split('\n');
    const position = params.position;
    const textBeforeCurLine = lines.slice(0, curLineNumber).join('\n');
    const range = Range.create(position.line, 0, position.line, position.character);
    const curLineContent = document.getText(range);
    const key = params.ch;
    const inputState = this.getInputLineState(params);

    const pos = params.position;
    if (key === '\n' && inputState === 'utterance' && lastLineContent.trim() !== '-') {
      const newPos = Position.create(pos.line, 0);
      const item: TextEdit = TextEdit.insert(newPos, '- ');
      edits.push(item);
    }

    if (key === '\n' && inputState === 'mlEntity' && lastLineContent.trim().endsWith('=')) {
      const mlEntities = util.getMLEntities(textBeforeCurLine);
      const entityNameRegExp = /^\s*@\s*([0-9a-zA-Z_.-]+)\s*.*/;
      let entityName = '';
      if (entityNameRegExp.test(lastLineContent)) {
        const entityGroup = lastLineContent.match(entityNameRegExp);
        if (entityGroup && entityGroup.length >= 2) {
          entityName = entityGroup[1];
        }
        if (mlEntities.includes(entityName)) {
          const newPos = Position.create(pos.line, 0);
          const item: TextEdit = TextEdit.insert(newPos, '\t-@');
          edits.push(item);
        }
      }
    }

    if (key === '\n' && inputState === 'listEntity' && lastLineContent.trim() !== '-') {
      const newPos = Position.create(pos.line, 0);
      let insertStr = '';
      const indentLevel = this.getIndentLevel(lastLineContent);
      if (lastLineContent.trim().endsWith(':') || lastLineContent.trim().endsWith('=')) {
        insertStr = '\t'.repeat(indentLevel + 1) + '-';
      } else {
        insertStr = '\t'.repeat(indentLevel) + '-';
      }

      const item: TextEdit = TextEdit.insert(newPos, insertStr);
      edits.push(item);

      //delete redundent \t from autoIndent
      const deleteRange = Range.create(pos.line, pos.character - indentLevel, pos.line, pos.character);
      const deleteItem: TextEdit = TextEdit.del(deleteRange);
      edits.push(deleteItem);
    }

    if (lastLineContent.trim() === '-') {
      const range = Range.create(pos.line - 1, 0, pos.line, curLineContent.length + 1);
      const item: TextEdit = TextEdit.del(range);
      edits.push(item);
    }

    return Promise.resolve(edits);
  }

  private getLastLineContent(params: TextDocumentPositionParams): string {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return '';
    }
    const content = document.getText();
    const position = params.position;
    if (position.line === 0) {
      return '';
    } else {
      return content.split('\n')[position.line - 1];
    }
  }

  private getIndentLevel(lineContent: string): number {
    if (lineContent.includes('-')) {
      const tabStr = lineContent.split('-')[0];
      let numOfTab = 0;
      let validIndentStr = true;
      tabStr.split('').forEach((u) => {
        if (u === '\t') {
          numOfTab += 1;
        } else {
          validIndentStr = false;
        }
      });

      if (validIndentStr) {
        return numOfTab;
      }
    }

    return 0;
  }

  private getInputLineState(params: DocumentOnTypeFormattingParams): LineState {
    const document = this.documents.get(params.textDocument.uri);
    const position = params.position;
    const regListEnity = /^\s*@\s*(list|phraseList)\s*.*$/;
    const regUtterance = /^\s*#.*$/;
    const regDashLine = /^\s*-.*$/;
    const mlEntity = /^\s*@\s*ml\s*.*$/;
    const regEntityDefLine = /^\s*@.*$/;
    let state: LineState = 'other';
    if (!document) {
      return 'other';
    }
    const lineContentList = document.getText().split('\n');
    for (let i = 0; i < position.line; i++) {
      const line = lineContentList[i];
      if (regListEnity.test(line)) {
        state = 'listEntity';
      } else if (regUtterance.test(line)) {
        state = 'utterance';
      } else if (mlEntity.test(line)) {
        state = 'mlEntity';
      } else if (regDashLine.test(line) || regEntityDefLine.test(line) || line.trim().startsWith('>')) {
        continue;
      } else {
        state = 'other';
      }
    }

    return state;
  }

  private async extractLUISContent(text: string): Promise<any> {
    let parsedContent: any;
    const log = false;
    const locale = 'en-us';
    try {
      parsedContent = await parseFile(text, log, locale);
    } catch (e) {
      // nothing to do in catch block
    }

    if (parsedContent !== undefined) {
      return Promise.resolve(parsedContent.LUISJsonStructure);
    } else {
      return undefined;
    }
  }

  protected async completion(params: TextDocumentPositionParams): Promise<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }

    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const curLineContent = document.getText(range);
    const luDoc = this.getLUDocument(document);
    const text = luDoc?.index().content || document.getText();
    const lines = text.split('\n');
    const curLineNumber = params.position.line;
    //const textBeforeCurLine = lines.slice(0, curLineNumber).join('\n');
    const textExceptCurLine = lines
      .slice(0, curLineNumber)
      .concat(lines.slice(curLineNumber + 1))
      .join('\n');
    const completionList: CompletionItem[] = [];
    if (util.isEntityType(curLineContent)) {
      const triggerChar = curLineContent[position.character - 1];
      const extraWhiteSpace = triggerChar === '@' ? ' ' : '';
      const entityTypes: string[] = EntityTypesObj.EntityType;
      entityTypes.forEach((entity) => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Keyword,
          insertText: `${extraWhiteSpace}${entity}`,
          documentation: `Enitity type: ${entity}`,
        };

        completionList.push(item);
      });
    }

    if (util.isPrebuiltEntity(curLineContent)) {
      const prebuiltTypes: string[] = EntityTypesObj.Prebuilt;
      const triggerChar = curLineContent[position.character - 1];
      const extraWhiteSpace = triggerChar !== ' ' ? ' ' : '';
      prebuiltTypes.forEach((entity) => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Keyword,
          insertText: `${extraWhiteSpace}${entity}`,
          documentation: `Prebuilt enitity: ${entity}`,
        };

        completionList.push(item);
      });
    }

    if (util.isRegexEntity(curLineContent)) {
      const item = {
        label: 'RegExp Entity',
        kind: CompletionItemKind.Keyword,
        insertText: `//`,
        documentation: `regex enitity`,
      };

      completionList.push(item);
    }

    if (util.isEntityName(curLineContent)) {
      const item = {
        label: 'hasRoles?',
        kind: CompletionItemKind.Keyword,
        insertText: `hasRoles`,
        documentation: `Entity name hasRole?`,
      };

      completionList.push(item);
      const item2 = {
        label: 'usesFeature?',
        kind: CompletionItemKind.Keyword,
        insertText: `usesFeature`,
        documentation: `Entity name usesFeature?`,
      };

      completionList.push(item2);
    }

    if (util.isPhraseListEntity(curLineContent)) {
      const item = {
        label: 'interchangeable synonyms?',
        kind: CompletionItemKind.Keyword,
        insertText: `interchangeable`,
        documentation: `interchangeable synonyms as part of the entity definition`,
      };

      completionList.push(item);
    }

    // completion for entities and patterns, use the text without current line due to usually it will cause parser errors, the luisjson will be undefined

    let luisJson = await this.extractLUISContent(text);
    if (!luisJson) {
      luisJson = await this.extractLUISContent(textExceptCurLine);
    }

    const suggestionEntityList = util.getSuggestionEntities(luisJson, util.suggestionAllEntityTypes);
    const regexEntityList = util.getRegexEntities(luisJson);

    //suggest a regex pattern for seperated line definition
    if (util.isSeperatedEntityDef(curLineContent)) {
      const seperatedEntityDef = /^\s*@\s*([\w._]+|"[\w._\s]+")+\s*=\s*$/;
      let entityName = '';
      const matchGroup = curLineContent.match(seperatedEntityDef);
      if (matchGroup && matchGroup.length >= 2) {
        entityName = matchGroup[1].trim();
      }

      if (regexEntityList.includes(entityName)) {
        const item = {
          label: 'RegExp Entity',
          kind: CompletionItemKind.Keyword,
          insertText: `//`,
          documentation: `regex enitity`,
        };

        completionList.push(item);
      }
    }

    // auto suggest pattern
    if (util.matchedEnterPattern(curLineContent)) {
      suggestionEntityList.forEach((name) => {
        const item = {
          label: `Entity: ${name}`,
          kind: CompletionItemKind.Property,
          insertText: `${name}`,
          documentation: `pattern suggestion for entity: ${name}`,
        };

        completionList.push(item);
      });
    }

    // suggestions for entities in a seperated line
    if (util.isEntityType(curLineContent)) {
      suggestionEntityList.forEach((entity) => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Property,
          insertText: `${entity}`,
          documentation: `Enitity type: ${entity}`,
        };

        completionList.push(item);
      });
    }

    if (util.isCompositeEntity(curLineContent)) {
      util.getSuggestionEntities(luisJson, util.suggestionNoCompositeEntityTypes).forEach((entity) => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Property,
          insertText: `${entity}`,
          documentation: `Enitity type: ${entity}`,
        };

        completionList.push(item);
      });
    }

    const suggestionRolesList = util.getSuggestionRoles(luisJson, util.suggestionAllEntityTypes);
    // auto suggest roles
    if (util.matchedRolesPattern(curLineContent)) {
      suggestionRolesList.forEach((name) => {
        const item = {
          label: `Role: ${name}`,
          kind: CompletionItemKind.Property,
          insertText: `${name}`,
          documentation: `roles suggestion for entity name: ${name}`,
        };

        completionList.push(item);
      });
    }

    if (util.matchedEntityPattern(curLineContent)) {
      suggestionEntityList.forEach((name) => {
        const item = {
          label: `Entity: ${name}`,
          kind: CompletionItemKind.Property,
          insertText: ` ${name}`,
          documentation: `pattern suggestion for entity: ${name}`,
        };
        completionList.push(item);
      });
    }

    if (util.matchedEntityCanUsesFeature(curLineContent, text, luisJson)) {
      const enitityName = util.extractEntityNameInUseFeature(curLineContent);
      const suggestionFeatureList = util.getSuggestionEntities(luisJson, util.suggestionNoPatternAnyEntityTypes);
      suggestionFeatureList.forEach((name) => {
        if (name !== enitityName) {
          const item = {
            label: `Entity: ${name}`,
            kind: CompletionItemKind.Method,
            insertText: `${name}`,
            documentation: `Feature suggestion for current entity: ${name}`,
          };

          completionList.push(item);
        }
      });
    }

    if (util.matchIntentInEntityDef(curLineContent)) {
      const item = {
        label: 'usesFeature?',
        kind: CompletionItemKind.Keyword,
        insertText: `usesFeature`,
        documentation: `Does this intent usesFeature?`,
      };

      completionList.push(item);
    }

    if (util.matchIntentUsesFeatures(curLineContent)) {
      const suggestionFeatureList = util.getSuggestionEntities(luisJson, util.suggestionNoPatternAnyEntityTypes);
      suggestionFeatureList.forEach((name) => {
        const item = {
          label: `Entity: ${name}`,
          kind: CompletionItemKind.Method,
          insertText: `${name}`,
          documentation: `Feature suggestion for current entity: ${name}`,
        };

        completionList.push(item);
      });
    }

    return Promise.resolve({ isIncomplete: false, items: completionList });
  }

  protected validate(document: TextDocument): void {
    this.cleanPendingValidation(document);
    document.uri,
      setTimeout(() => {
        this.pendingValidationRequests.delete(document.uri);
        this.doValidate(document);
      });
  }

  protected cleanPendingValidation(document: TextDocument): void {
    const request = this.pendingValidationRequests.get(document.uri);
    if (request !== undefined) {
      clearTimeout(request);
      this.pendingValidationRequests.delete(document.uri);
    }
  }

  protected doValidate(document: TextDocument): void {
    const text = document.getText();
    const luDoc = this.getLUDocument(document);
    if (!luDoc) {
      return;
    }
    const { fileId, sectionId } = luDoc;
    const luFile = luDoc.index();
    if (!luFile) {
      return;
    }

    if (text.length === 0) {
      this.cleanDiagnostics(document);
      return;
    }

    const { diagnostics } = luFile;

    // if inline editor, concat new content for validate
    if (fileId && sectionId) {
      const sectionDiags = checkSection(
        {
          Name: sectionId,
          Body: text,
        },
        true
      );
      // error in section.
      if (isValid(sectionDiags) === false) {
        const lspDiagnostics = convertDiagnostics(sectionDiags, document, 1);
        this.sendDiagnostics(document, lspDiagnostics);
        return;
      }
    }
    const lspDiagnostics = convertDiagnostics(diagnostics, document);
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
