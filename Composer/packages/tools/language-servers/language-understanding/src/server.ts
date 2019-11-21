import * as fs from 'fs';
import { xhr, getErrorStatusDescription } from 'request-light';
import URI from 'vscode-uri';
import { MessageReader, MessageWriter } from 'vscode-jsonrpc';
import { IConnection, TextDocuments, createConnection } from 'vscode-languageserver';
import {
  TextDocument,
  Diagnostic,
  CompletionList,
  Hover,
  Position,
  CompletionItemKind,
  Range,
  DiagnosticSeverity,
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import { EntityTypesObj } from './entityEnum';

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
            triggerCharacters: ['@', ' ', '{'],
          },
          hoverProvider: true,
          foldingRangeProvider: false,
        },
      };
    });
    this.connection.onCompletion(params => this.completion(params));
    this.connection.onHover(params => this.hover(params));
  }

  start() {
    this.connection.listen();
  }

  protected hover(params: TextDocumentPositionParams): Thenable<Hover | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
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
    try {
      parsedContent = await parseFile(content, false, 'en-us');
      if (parsedContent !== undefined) {
        try {
          validateLUISBlob(parsedContent.LUISJsonStructure);
        } catch (e) {
          const range = Range.create(Position.create(0, 0), Position.create(0, 1));
          const diagnostic: Diagnostic = Diagnostic.create(range, e.text, DiagnosticSeverity.Error);
          errors.push(diagnostic);
        }
      }
    } catch (e) {
      e.text.split('\n').forEach(msg => {
        const matched = msg.match(/line\s(\d+:\d+)/g);
        const positions: Position[] = [];
        matched.forEach(element => {
          let { row, col } = element.match(/(?<row>\d+):(?<col>\d+)/).groups;
          positions.push(Position.create(parseInt(row) - 1, parseInt(col)));
        });

        if (positions.length == 1) {
          positions.push(Position.create(positions[0].line, positions[0].character + 1));
        }
        const range = Range.create(positions[0], positions[1]);
        const diagnostic: Diagnostic = Diagnostic.create(range, msg, DiagnosticSeverity.Error);
        errors.push(diagnostic);
      });
    }

    return Promise.resolve({ parsedContent, errors });
  }

  private async extractLUISContent(text: string): Promise<any> {
    let parsedContent: any;
    try {
      parsedContent = await parseFile(text, false, 'en-us');
    } catch (e) {
      // nothong to do in catch block
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

  private isListEntityMode(params: TextDocumentPositionParams): boolean {
    return false;
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
    const entitiesList: string[] = [];
    const regexList: string[] = [];
    const pattenAnyList: string[] = [];
    const prebuiltList: string[] = [];
    const closedList: string[] = [];

    const luisJson = await this.extractLUISContent(text);

    if (luisJson !== undefined) {
      if (luisJson.entities !== undefined && luisJson.entities.length > 0) {
        luisJson.entities.forEach(entity => {
          entitiesList.push(entity.name);
        });
      }

      if (luisJson.regex_entities !== undefined && luisJson.regex_entities.length > 0) {
        luisJson.regex_entities.forEach(entity => {
          regexList.push(entity.name);
        });
      }

      if (luisJson.patternAnyEntities !== undefined && luisJson.patternAnyEntities.length > 0) {
        luisJson.patternAnyEntities.forEach(entity => {
          pattenAnyList.push(entity.name);
        });
      }

      if (luisJson.prebuiltEntities !== undefined && luisJson.prebuiltEntities.length > 0) {
        luisJson.prebuiltEntities.forEach(entity => {
          prebuiltList.push(entity.name);
        });
      }

      if (luisJson.closedLists !== undefined && luisJson.closedLists.length > 0) {
        luisJson.closedLists.forEach(entity => {
          closedList.push(entity.name);
        });
      }

      // auto suggest pattern
      if (this.matchedEnterPattern(params)) {
        entitiesList.forEach(name => {
          const item = {
            label: `Entity: ${name}`,
            kind: CompletionItemKind.Property,
            insertText: ` ${name} =`,
            documentation: `pattern suggestion for entity: ${name}`,
          };

          completionList.push(item);
        });
      }

      // features suggestions
    }

    return Promise.resolve({ isIncomplete: true, items: completionList });
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
