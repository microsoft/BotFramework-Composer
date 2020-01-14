// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';

import { xhr, getErrorStatusDescription } from 'request-light';
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

import { EntityTypesObj, LineState } from './entityEnum';

const parseFile = require('@bfcomposer/bf-lu/lib/parser/lufile/parseFileContents.js').parseFile;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const validateLUISBlob = require('@bfcomposer/bf-lu/lib/parser/luis/luisValidator');
const LABELEXPERIENCEREQUEST = 'labelingExperienceRequest';
export class LUServer {
  protected workspaceRoot: URI | undefined;
  protected readonly documents = new TextDocuments();
  protected readonly pendingValidationRequests = new Map<string, number>();

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
            triggerCharacters: ['@', ' ', '{', ':', '['],
          },
          foldingRangeProvider: false,
          documentOnTypeFormattingProvider: {
            firstTriggerCharacter: '\n',
          },
        },
      };
    });
    this.connection.onCompletion(params => this.completion(params));
    this.connection.onDocumentOnTypeFormatting(docTypingParams => this.docTypeFormat(docTypingParams));
    this.connection.onRequest((method, params) => {
      if (method === LABELEXPERIENCEREQUEST) {
        this.labelingExperienceHandler(params);
      }
    });
  }

  start() {
    this.connection.listen();
  }

  protected removeLabelsInUtterance(lineContent: string): string {
    const entityLabelRegex = /\{\s*[\w.]+\s*=\s*[\w.]+\s*\}/g;
    let match: RegExpMatchArray | null;
    let resultStr = '';
    let startIdx = 0;
    while ((match = entityLabelRegex.exec(lineContent))) {
      const leftBoundIdx = match.index;
      const rightBoundIdx = entityLabelRegex.lastIndex;
      resultStr += lineContent.slice(startIdx, leftBoundIdx);
      if (leftBoundIdx && rightBoundIdx) {
        const entityStr = lineContent.slice(leftBoundIdx + 1, rightBoundIdx - 1);
        if (entityStr.split('=').length == 2) {
          const enitity = entityStr.split('=')[1].trim();
          resultStr += enitity;
        }

        startIdx = rightBoundIdx;
      }
    }

    return resultStr;
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
    const labeledUtterRegex = /^\s*-([^{}]*\s*\{[\w.]+\s*=\s*[\w.]+\}[^{}]*)+/;

    if (labeledUtterRegex.test(curLineContent)) {
      const newText = this.removeLabelsInUtterance(curLineContent);
      const newPos = Position.create(position.lineNumber, 0);
      const newUnlalbelText = newText + '\n';
      const editPreviousLine: TextEdit = TextEdit.insert(newPos, newUnlalbelText);
      const newPos2 = Position.create(position.lineNumber - 1, 0);
      const editNextLine: TextEdit = TextEdit.insert(newPos2, newUnlalbelText);
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
    const lineCount = document.lineCount;
    const text = document.getText();
    const lines = text.split('\n');
    const textBeforeCurLine = lines.slice(0, curLineNumber - 1).join('\n');
    //const luisJson = await this.extractLUISContent(textBeforeCurLine);
    const key = params.ch;
    const inputState = this.getInputLineState(params);
    //const entitiesList = this.getEntitiesList(luisJson);
    const pos = params.position;
    if (
      key === '\n' &&
      inputState === 'utterance' &&
      lastLineContent.trim() !== '-' &&
      curLineNumber === lineCount - 1
    ) {
      const newPos = Position.create(pos.line + 1, 0);
      const item: TextEdit = TextEdit.insert(newPos, '- ');
      edits.push(item);
    }

    if (key === '\n' && inputState === 'mlEntity' && lastLineContent.trim().endsWith('=')) {
      const mlEntities = this.getMLEntities(textBeforeCurLine);
      const entityNameRegExp = /^\s*@\s*([0-9a-zA-Z_.-]+)\s*.*/;
      let entityName = '';
      if (entityNameRegExp.test(lastLineContent)) {
        const entityGroup = lastLineContent.match(entityNameRegExp);
        if (entityGroup && entityGroup.length >= 2) {
          entityName = entityGroup[1];
        }
        if (mlEntities.includes(entityName)) {
          const newPos = Position.create(pos.line + 1, 0);
          const item: TextEdit = TextEdit.insert(newPos, '\t-@ ');
          edits.push(item);
        }
      }
    }

    if (
      key === '\n' &&
      inputState === 'listEntity' &&
      lastLineContent.trim() !== '-' &&
      curLineNumber === lineCount - 1
    ) {
      const newPos = Position.create(pos.line + 1, 0);
      let insertStr = '';
      if (lastLineContent.trim().endsWith(':') || lastLineContent.trim().endsWith('=')) {
        insertStr = '\t- ';
      } else {
        insertStr = '- ';
      }
      const item: TextEdit = TextEdit.insert(newPos, insertStr);
      edits.push(item);
    }

    if (lastLineContent.trim() === '-') {
      const range = Range.create(pos.line - 1, 0, pos.line - 1, lastLineContent.length - 1);
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

  private getInputLineState(params: DocumentOnTypeFormattingParams): LineState {
    const document = this.documents.get(params.textDocument.uri);
    const position = params.position;
    const regListEnity = /^\s*@\s*list\s*.*/;
    const regUtterance = /^\s*#.*/;
    const regDashLine = /^\s*-.*/;
    const mlEntity = /^\s*@\s*ml\s*.*/;
    const regEntityDefLine = /^\s*@.*/;
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
      } else if (regDashLine.test(line) || regEntityDefLine.test(line)) {
        continue;
      } else {
        state = 'other';
      }
    }

    return state;
  }

  private getMLEntities(text: string): string[] {
    const lines = text.split('\n');

    const mlEntityRegExp = /^\s*@\s*ml\s*([0-9a-zA-Z_.-]+)\s*.*/;
    const mlEntities: string[] = [];
    for (const line of lines) {
      if (mlEntityRegExp.test(line)) {
        const entityGroup = line.match(mlEntityRegExp);
        if (entityGroup && entityGroup.length >= 2) {
          mlEntities.push(entityGroup[1]);
        }
      }
    }

    return mlEntities;
  }

  protected async resovleSchema(url: string): Promise<string> {
    const uri = URI.parse(url);
    if (uri.scheme === 'file') {
      return new Promise<string>((resolve, reject) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(uri.fsPath, 'UTF-8', (err, result) => {
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

  private async validateLuBody(content: string): Promise<{ parsedContent: any; errors: any }> {
    const errors: Diagnostic[] = [];
    let parsedContent: any;
    const log = false;
    const locale = 'en-us';
    try {
      parsedContent = await parseFile(content, log, locale);
      if (parsedContent !== undefined) {
        try {
          validateLUISBlob(parsedContent.LUISJsonStructure);
        } catch (e) {
          e.diagnostics.forEach(diag => {
            const range = Range.create(0, 0, 0, 1);
            const message = diag.Message;
            const severity = DiagnosticSeverity.Error;
            errors.push(Diagnostic.create(range, message, severity));
          });
        }
      }
    } catch (e) {
      e.diagnostics.forEach(diag => {
        const range = Range.create(
          diag.Range.Start.Line,
          diag.Range.Start.Character,
          diag.Range.End.Line,
          diag.Range.End.Character
        );
        const message = diag.Message;
        const severity = DiagnosticSeverity.Error;
        errors.push(Diagnostic.create(range, message, severity));
      });
    }

    return Promise.resolve({ parsedContent, errors });
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

  private isEntityType(content: string): boolean {
    const regexEntifyDef = /^\s*@\s*$/;
    return regexEntifyDef.test(content);
  }

  private isPrebuiltEntity(content: string): boolean {
    const regexPrebuiltEntifyDef = /^\s*@\s*prebuilt\s*$/;
    return regexPrebuiltEntifyDef.test(content);
  }

  private isRegexEntity(content: string): boolean {
    const regexPrebuiltEntifyDef = /^\s*@\s*regex\s*([\w._]+|"[\w._\s]+")+\s*=\s*$/;
    return regexPrebuiltEntifyDef.test(content);
  }

  private isSeperatedEntityDef(content: string): boolean {
    const regexPrebuiltEntifyDef = /^\s*@\s*([\w._]+|"[\w._\s]+")+\s*=\s*$/;
    return regexPrebuiltEntifyDef.test(content);
  }

  private isEntityName(content: string): boolean {
    const hasNameEntifyDef = /^\s*@\s*(ml|list|regex|prebuilt|composite|patternany|phraselist)\s*([\w._]+|"[\w._\s]+")\s*$/;
    const hasTypeEntityDef = /^\s*@\s*(ml|list|regex|prebuilt|composite|patternany|phraselist)\s*$/;
    const hasNameEntifyDef2 = /^\s*@\s*([\w._]+|"[\w._\s]+")\s*$/;
    return hasNameEntifyDef.test(content) || (!hasTypeEntityDef.test(content) && hasNameEntifyDef2.test(content));
  }

  private isCompositeEntity(content: string): boolean {
    const compositePatternDef = /^\s*@\s*composite\s*[\w]*\s*=\s*\[\s*.*\s*$/;
    const compositePatternDef2 = /^\s*@\s*composite\s*[\w]*\s*=\s*\[\s*.*\s*\]\s*$/;
    return compositePatternDef.test(content) || compositePatternDef2.test(content);
  }
  private matchedEnterPattern(content: string): boolean {
    const regexPatternDef = /^\s*-.*{\s*$/;
    const regexPatternDef2 = /^\s*-.*{\s*}$/;
    return regexPatternDef.test(content) || regexPatternDef2.test(content);
  }

  private matchedRolesPattern(content: string): boolean {
    const regexRolesPatternDef = /^\s*-.*{\s*.*:/;
    const regexRolesPatternDef2 = /^\s*-.*{\s*.*:}/;
    return regexRolesPatternDef.test(content) || regexRolesPatternDef2.test(content);
  }

  private matchedEntityPattern(content: string): boolean {
    const regexRolesEntityPatternDef = /^\s*-.*{\s*@/;
    const regexRolesEntityPatternDef2 = /^\s*-.*{\s*@}/;
    return regexRolesEntityPatternDef.test(content) || regexRolesEntityPatternDef2.test(content);
  }

  private getRegexEntities(luisJson: any): string[] {
    const suggestionRegexList: string[] = [];
    if (luisJson !== undefined) {
      if (luisJson.regex_entities !== undefined && luisJson.regex_entities.length > 0) {
        luisJson.regex_entities.forEach(entity => {
          suggestionRegexList.push(entity.name);
        });
      }
    }

    return suggestionRegexList;
  }

  private getSuggestionEntities(luisJson: any): string[] {
    const suggestionEntityList: string[] = [];
    if (luisJson !== undefined) {
      if (luisJson.entities !== undefined && luisJson.entities.length > 0) {
        luisJson.entities.forEach(entity => {
          suggestionEntityList.push(entity.name);
        });
      }

      if (luisJson.regex_entities !== undefined && luisJson.regex_entities.length > 0) {
        luisJson.regex_entities.forEach(entity => {
          suggestionEntityList.push(entity.name);
        });
      }

      if (luisJson.patternAnyEntities !== undefined && luisJson.patternAnyEntities.length > 0) {
        luisJson.patternAnyEntities.forEach(entity => {
          suggestionEntityList.push(entity.name);
        });
      }

      if (luisJson.prebuiltEntities !== undefined && luisJson.prebuiltEntities.length > 0) {
        luisJson.prebuiltEntities.forEach(entity => {
          suggestionEntityList.push(entity.name);
        });
      }

      if (luisJson.closedLists !== undefined && luisJson.closedLists.length > 0) {
        luisJson.closedLists.forEach(entity => {
          suggestionEntityList.push(entity.name);
        });
      }

      if (luisJson.phraselists !== undefined && luisJson.closedLists.length > 0) {
        luisJson.composites.forEach(entity => {
          suggestionEntityList.push(entity.name);
        });
      }

      if (luisJson.phraselists !== undefined && luisJson.closedLists.length > 0) {
        luisJson.composites.forEach(entity => {
          suggestionEntityList.push(entity.name);
        });
      }
    }

    return suggestionEntityList;
  }

  private getSuggestionRoles(luisJson: any): string[] {
    const suggestionRolesList: string[] = [];
    if (luisJson !== undefined) {
      if (luisJson.entities !== undefined && luisJson.entities.length > 0) {
        luisJson.entities.forEach(entity => {
          if (entity.roles !== undefined && entity.roles.length > 0) {
            entity.roles.forEach(role => {
              suggestionRolesList.push(role);
            });
          }
        });
      }

      if (luisJson.regex_entities !== undefined && luisJson.regex_entities.length > 0) {
        luisJson.regex_entities.forEach(entity => {
          if (entity.roles !== undefined && entity.roles.length > 0) {
            entity.roles.forEach(role => {
              suggestionRolesList.push(role);
            });
          }
        });
      }

      if (luisJson.patternAnyEntities !== undefined && luisJson.patternAnyEntities.length > 0) {
        luisJson.patternAnyEntities.forEach(entity => {
          if (entity.roles !== undefined && entity.roles.length > 0) {
            entity.roles.forEach(role => {
              suggestionRolesList.push(role);
            });
          }
        });
      }

      if (luisJson.prebuiltEntities !== undefined && luisJson.prebuiltEntities.length > 0) {
        luisJson.prebuiltEntities.forEach(entity => {
          if (entity.roles !== undefined && entity.roles.length > 0) {
            entity.roles.forEach(role => {
              suggestionRolesList.push(role);
            });
          }
        });
      }

      if (luisJson.closedLists !== undefined && luisJson.closedLists.length > 0) {
        luisJson.closedLists.forEach(entity => {
          if (entity.roles !== undefined && entity.roles.length > 0) {
            entity.roles.forEach(role => {
              suggestionRolesList.push(role);
            });
          }
        });
      }

      if (luisJson.phraselists !== undefined && luisJson.closedLists.length > 0) {
        luisJson.composites.forEach(entity => {
          if (entity.roles !== undefined && entity.roles.length > 0) {
            entity.roles.forEach(role => {
              suggestionRolesList.push(role);
            });
          }
        });
      }

      if (luisJson.phraselists !== undefined && luisJson.closedLists.length > 0) {
        luisJson.composites.forEach(entity => {
          if (entity.roles !== undefined && entity.roles.length > 0) {
            entity.roles.forEach(role => {
              suggestionRolesList.push(role);
            });
          }
        });
      }
    }

    return suggestionRolesList;
  }

  protected async completion(params: TextDocumentPositionParams): Promise<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }

    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const curLineContent = document.getText(range);
    const text = document.getText();
    const completionList: CompletionItem[] = [];
    if (this.isEntityType(curLineContent)) {
      const entityTypes: string[] = EntityTypesObj.EntityType;
      entityTypes.forEach(entity => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Keyword,
          insertText: ` ${entity}`,
          documentation: `Enitity type: ${entity}`,
        };

        completionList.push(item);
      });
    }

    if (this.isPrebuiltEntity(curLineContent)) {
      const prebuiltTypes: string[] = EntityTypesObj.Prebuilt;
      prebuiltTypes.forEach(entity => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Keyword,
          insertText: ` ${entity}`,
          documentation: `Prebuilt enitity: ${entity}`,
        };

        completionList.push(item);
      });
    }

    if (this.isRegexEntity(curLineContent)) {
      const item = {
        label: 'RegExp Entity',
        kind: CompletionItemKind.Keyword,
        insertText: ` //`,
        documentation: `regex enitity`,
      };

      completionList.push(item);
    }

    if (this.isEntityName(curLineContent)) {
      const item = {
        label: 'hasRoles?',
        kind: CompletionItemKind.Keyword,
        insertText: `hasRoles `,
        documentation: `Entity name hasRole?`,
      };

      completionList.push(item);
      const item2 = {
        label: 'useFeature?',
        kind: CompletionItemKind.Keyword,
        insertText: `useFeature `,
        documentation: `Entity name useFeature?`,
      };

      completionList.push(item2);
    }

    // completion for entities and patterns, use the text without current line due to usually it will cause parser errors, the luisjson will be undefined
    //const lines = text.split('\n');
    //const textBeforeCurLine = lines.slice(0, position.line).join('\n');
    const luisJson = await this.extractLUISContent(text);
    const suggestionEntityList = this.getSuggestionEntities(luisJson);
    const regexEntityList = this.getRegexEntities(luisJson);

    //suggest a regex pattern for seperated line definition
    if (this.isSeperatedEntityDef(curLineContent)) {
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
          insertText: ` //`,
          documentation: `regex enitity`,
        };

        completionList.push(item);
      }
    }

    // auto suggest pattern
    if (this.matchedEnterPattern(curLineContent)) {
      suggestionEntityList.forEach(name => {
        const item = {
          label: `Entity: ${name}`,
          kind: CompletionItemKind.Property,
          insertText: ` ${name}`,
          documentation: `pattern suggestion for entity: ${name}`,
        };

        completionList.push(item);
      });
    }

    // suggestions for entities in a seperated line
    if (this.isEntityType(curLineContent)) {
      suggestionEntityList.forEach(entity => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Property,
          insertText: ` ${entity}`,
          documentation: `Enitity type: ${entity}`,
        };

        completionList.push(item);
      });
    }

    if (this.isCompositeEntity(curLineContent)) {
      suggestionEntityList.forEach(entity => {
        const item = {
          label: entity,
          kind: CompletionItemKind.Property,
          insertText: ` ${entity}`,
          documentation: `Enitity type: ${entity}`,
        };

        completionList.push(item);
      });
    }

    const suggestionRolesList = this.getSuggestionRoles(luisJson);
    // auto suggest roles
    if (this.matchedRolesPattern(curLineContent)) {
      suggestionRolesList.forEach(name => {
        const item = {
          label: `Role: ${name}`,
          kind: CompletionItemKind.Property,
          insertText: ` ${name}`,
          documentation: `roles suggestion for entity name: ${name}`,
        };

        completionList.push(item);
      });
    }

    if (this.matchedEntityPattern(curLineContent)) {
      suggestionEntityList.forEach(name => {
        const item = {
          label: `Entity: ${name}`,
          kind: CompletionItemKind.Property,
          insertText: ` ${name}`,
          documentation: `pattern suggestion for entity: ${name}`,
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
    if (document.getText().length === 0) {
      this.cleanDiagnostics(document);
      return;
    }

    const text = document.getText();
    this.validateLuBody(text).then(result => {
      const diagnostics: Diagnostic[] = result.errors;
      this.sendDiagnostics(document, diagnostics);
    });
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
