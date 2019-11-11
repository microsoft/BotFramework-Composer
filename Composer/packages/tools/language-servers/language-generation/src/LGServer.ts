// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
  CompletionItem,
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import * as lg from 'botbuilder-lg';
import get from 'lodash.get';

import { buildInfunctionsMap } from './builtinFunctions';
import {
  getRangeAtPosition,
  convertSeverity,
  getLGResources,
  updateTemplateInContent,
  getTemplatePositionOffset,
} from './utils';

export function start(reader: MessageReader, writer: MessageWriter): LgServer {
  const connection = createConnection(reader, writer);
  const server = new LgServer(connection);
  server.start();
  return server;
}

// define init methods call from client
const InitializeDocumentsMethodName = 'initializeDocuments';

interface LGDocument {
  uri: string;
  content: string;
  template: {
    Name: string;
    Body: string;
  };
}

export class LgServer {
  protected workspaceRoot: URI | undefined;
  protected readonly documents = new TextDocuments();
  protected readonly pendingValidationRequests = new Map<string, number>();
  protected LGDocuments: LGDocument[] = []; // LG Documents Store

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
        const { uri, content, template } = params;
        this.LGDocuments.push({ uri, content, template });
        // run diagnostic
        const textDocument = this.documents.get(uri);
        if (textDocument) {
          this.doValidate(textDocument);
        }
      }
    });
  }

  start() {
    this.connection.listen();
  }

  protected getLGDocument(document: TextDocument): LGDocument | undefined {
    const LGDocument = this.LGDocuments.find(item => item.uri === document.uri);
    return LGDocument;
  }
  protected getLGDocumentContent(document: TextDocument): string {
    const LGDocument = this.LGDocuments.find(item => item.uri === document.uri);
    let text = document.getText();
    if (LGDocument) {
      // concat new content
      const { content, template } = LGDocument;
      text = updateTemplateInContent(content, template);
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
    const templates = lgResources.Templates;
    const wordRange = getRangeAtPosition(document, params.position);
    let word = document.getText(wordRange);
    const matchItem = templates.find(u => u.Name === word);
    if (matchItem) {
      const hoveritem: Hover = { contents: [matchItem.Source, matchItem.Body] };
      return Promise.resolve(hoveritem);
    }
    if (word.startsWith('builtin.')) {
      word = word.substring('builtin.'.length);
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

  protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const text = this.getLGDocumentContent(document);
    const lgResources = getLGResources(text);
    const templates = lgResources.Templates;
    const completionList: CompletionItem[] = [];
    templates.forEach(template => {
      const item = {
        label: template.Name,
        kind: CompletionItemKind.Reference,
        insertText:
          template.Parameters.length > 0 ? template.Name + '(' + template.Parameters.join(', ') + ')' : template.Name,
        documentation: template.Body,
      };
      completionList.push(item);
    });

    buildInfunctionsMap.forEach((value, key) => {
      const item = {
        label: key,
        kind: CompletionItemKind.Function,
        insertText: key + '(' + value.Params.toString() + ')',
        documentation: value.Introduction,
      };
      completionList.push(item);
    });

    return Promise.resolve({ isIncomplete: true, items: completionList });
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
    if (request !== undefined) {
      clearTimeout(request);
      this.pendingValidationRequests.delete(document.uri);
    }
  }

  protected doValidate(document: TextDocument): void {
    let text = document.getText();
    let lineOffset = 0;
    const LGDocument = this.getLGDocument(document);
    if (LGDocument) {
      // concat new content for validate
      const { content, template } = LGDocument;
      const updatedTemplate = {
        Name: template.Name,
        Body: text,
      };
      text = updateTemplateInContent(content, updatedTemplate);
      lineOffset = getTemplatePositionOffset(content, updatedTemplate);
    }

    if (text.length === 0) {
      this.cleanDiagnostics(document);
      return;
    }
    const staticChercher = new lg.StaticChecker();
    const lgDiags = staticChercher.checkText(text, '', lg.ImportResolver.fileResolver);
    const diagnostics: Diagnostic[] = [];
    lgDiags.forEach(diag => {
      const diagnostic: Diagnostic = {
        severity: convertSeverity(diag.Severity),
        range: {
          start: Position.create(diag.Range.Start.Line - 1 - lineOffset, diag.Range.Start.Character),
          end: Position.create(diag.Range.End.Line - 1 - lineOffset, diag.Range.End.Character),
        },
        message: diag.Message,
        source: document.uri,
      };
      diagnostics.push(diagnostic);
    });

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
