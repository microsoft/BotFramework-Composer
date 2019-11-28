import * as fs from 'fs';
import { xhr, getErrorStatusDescription } from 'request-light';
import URI from 'vscode-uri';
import { MessageReader, MessageWriter } from 'vscode-jsonrpc';
import { IConnection, TextDocuments, createConnection } from 'vscode-languageserver';
import {
  TextDocument,
  Diagnostic,
  CompletionList,
  Position,
  CompletionItemKind,
  Range,
  DiagnosticSeverity,
  TextEdit,
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams, DocumentOnTypeFormattingParams } from 'vscode-languageserver-protocol';
import { EntityTypesObj, LineState } from './entityEnum';

const parseFile = require('@bfcomposer/bf-lu/lib/parser/lufile/parseFileContents.js').parseFile;
const validateLUISBlob = require('@bfcomposer/bf-lu/lib/parser/luis/luisValidator');

export function start(reader: MessageReader, writer: MessageWriter): LuServer {
  const connection = createConnection(reader, writer);
  const server = new LuServer(connection);
  server.start();
  return server;
}

export class LuServer {
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
            triggerCharacters: ['@', ' ', '{', ':'],
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
  }

  start() {
    this.connection.listen();
  }

  private getLastLineContent(params: TextDocumentPositionParams): string {
    const document = this.documents.get(params.textDocument.uri);
    const content = document.getText();
    const position = params.position;
    if (position.line === 0) {
      return '';
    } else {
      return content.split('\n')[position.line - 1];
    }
  }

  private getCurrentLineContent(params: TextDocumentPositionParams): string {
    const document = this.documents.get(params.textDocument.uri);
    const position = params.position;
    if (position.line === 0) {
      return '';
    } else {
      const range = Range.create(position.line, 0, position.line, position.character);
      return document.getText(range);
    }
  }

  private getInputLineState(params: DocumentOnTypeFormattingParams): LineState {
    const document = this.documents.get(params.textDocument.uri);
    const position = params.position;
    const regListEnity = /^\s*@\s*list\s*.*/;
    const regUtterance = /^\s*#.*/;
    const regDashLine = /^\s*-.*/;
    let state: LineState = 'other';
    const lineContentList = document.getText().split('\n');
    for (let i = 0; i < position.line; i++) {
      const line = lineContentList[i];
      if (regListEnity.test(line)) {
        state = 'listEntity';
      } else if (regUtterance.test(line)) {
        state = 'utterance';
      } else if (regDashLine.test(line)) {
        continue;
      } else {
        state = 'other';
      }
    }

    return state;
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
    if (
      params.ch == '\n' &&
      this.getInputLineState(params) === 'utterance' &&
      lastLineContent.trim() !== '-' &&
      curLineNumber === lineCount - 1
    ) {
      const pos = params.position;
      const newPos = Position.create(pos.line + 1, 0);
      const item: TextEdit = TextEdit.insert(newPos, '-');
      edits.push(item);
    }

    if (
      params.ch == '\n' &&
      this.getInputLineState(params) === 'listEntity' &&
      lastLineContent.trim() !== '-' &&
      curLineNumber === lineCount - 1
    ) {
      const pos = params.position;
      const newPos = Position.create(pos.line + 1, 0);
      let insertStr = '';
      if (lastLineContent.trim().endsWith(':')) {
        insertStr = '\t- ';
      } else {
        insertStr = '- ';
      }
      const item: TextEdit = TextEdit.insert(newPos, insertStr);
      edits.push(item);
    }

    if (lastLineContent.trim() === '-') {
      const pos = params.position;
      const range = Range.create(pos.line - 1, 0, pos.line - 1, lastLineContent.length - 1);
      const item: TextEdit = TextEdit.del(range);
      edits.push(item);
    }

    return Promise.resolve(edits);
  }

  protected async resovleSchema(url: string): Promise<string> {
    const uri = URI.parse(url);
    if (uri.scheme === 'file') {
      return new Promise<string>((resolve, reject) => {
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
    let errors: Diagnostic[] = [];
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

  private isEntityType(params: TextDocumentPositionParams): boolean {
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const document = this.documents.get(params.textDocument.uri);
    const lineContent = document.getText(range);
    const regexEntifyDef: RegExp = /^\s*@\s*$/;

    return regexEntifyDef.test(lineContent);
  }

  private isPrebuiltEntity(params: TextDocumentPositionParams): boolean {
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const document = this.documents.get(params.textDocument.uri);
    const lineContent = document.getText(range);
    const regexPrebuiltEntifyDef: RegExp = /^\s*@\s*prebuilt\s*$/;

    return regexPrebuiltEntifyDef.test(lineContent);
  }

  private isRegexEntity(params: TextDocumentPositionParams): boolean {
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const document = this.documents.get(params.textDocument.uri);
    const lineContent = document.getText(range);
    const regexPrebuiltEntifyDef: RegExp = /^\s*@\s*regex\s*([\w._]+|"[\w._\s]+")+\s*=\s*$/;

    return regexPrebuiltEntifyDef.test(lineContent);
  }

  private isEntityName(params: TextDocumentPositionParams): boolean {
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const document = this.documents.get(params.textDocument.uri);
    const lineContent = document.getText(range);
    const regexhasNameEntifyDef: RegExp = /^\s*@\s*(ml|list|composite|patternany|phraselist)\s*([\w._]+|"[\w._\s]+")\s*$/;

    return regexhasNameEntifyDef.test(lineContent);
  }

  private matchedEnterPattern(params: TextDocumentPositionParams): boolean {
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const document = this.documents.get(params.textDocument.uri);
    const lineContent = document.getText(range);
    const regexPatternDef: RegExp = /^\s*-.*{\s*$/;
    const regexPatternDef2: RegExp = /^\s*-.*{\s*}$/;

    return regexPatternDef.test(lineContent) || regexPatternDef2.test(lineContent);
  }

  private matchedRolesPattern(params: TextDocumentPositionParams): boolean {
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const document = this.documents.get(params.textDocument.uri);
    const lineContent = document.getText(range);
    const regexRolesPatternDef: RegExp = /^\s*-.*{\s*.*:/;
    const regexRolesPatternDef2: RegExp = /^\s*-.*{\s*.*:}/;

    return regexRolesPatternDef.test(lineContent) || regexRolesPatternDef2.test(lineContent);
  }

  private matchedRolesAndEntityPattern(params: TextDocumentPositionParams): boolean {
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const document = this.documents.get(params.textDocument.uri);
    const lineContent = document.getText(range);
    const regexRolesEntityPatternDef: RegExp = /^\s*-.*{\s*@/;
    const regexRolesEntityPatternDef2: RegExp = /^\s*-.*{\s*@}/;

    return regexRolesEntityPatternDef.test(lineContent) || regexRolesEntityPatternDef2.test(lineContent);
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

    const text = document.getText();
    const completionList = [];
    if (this.isEntityType(params)) {
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

    if (this.isPrebuiltEntity(params)) {
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

    if (this.isRegexEntity(params)) {
      const item = {
        label: 'RegExp Entity',
        kind: CompletionItemKind.Keyword,
        insertText: ` //`,
        documentation: `regex enitity`,
      };

      completionList.push(item);
    }

    if (this.isEntityName(params)) {
      const item = {
        label: 'hasRoles?',
        kind: CompletionItemKind.Keyword,
        insertText: ` hasrole `,
        documentation: `Entity name hasRole?`,
      };

      completionList.push(item);
      const item2 = {
        label: 'useFeature?',
        kind: CompletionItemKind.Keyword,
        insertText: ` usesFeature `,
        documentation: `Entity name useFeature?`,
      };

      completionList.push(item2);
    }

    // completion for entities and patterns
    const luisJson = await this.extractLUISContent(text);
    const suggestionEntityList = this.getSuggestionEntities(luisJson);
    // auto suggest pattern
    if (this.matchedEnterPattern(params)) {
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

    const suggestionRolesList = this.getSuggestionRoles(luisJson);
    // auto suggest roles
    if (this.matchedRolesPattern(params)) {
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

    if (this.matchedRolesAndEntityPattern(params)) {
      suggestionRolesList.forEach(name => {
        const item = {
          label: `Role: ${name}`,
          kind: CompletionItemKind.Property,
          insertText: ` ${name}`,
          documentation: `roles suggestion for entity name: ${name}`,
        };

        completionList.push(item);
      });

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
