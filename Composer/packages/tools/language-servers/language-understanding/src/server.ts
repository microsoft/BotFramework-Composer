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

const parseFile = require('@microsoft/bf-lu/lib/parser/lufile/parseFileContents.js').parseFile;
const validateLUISBlob = require('@microsoft/bf-lu/lib/parser/luis/luisValidator');

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
          e.text.split('\n').forEach(msg => {
            const matched = msg.match(/line\s(\d+:\d+)/g);
            const positions: Position[] = [];
            matched.forEach(element => {
              let { row, col } = element.match(/(?<row>\d+):(?<col>\d+)/).groups;
              positions.push(Position.create(parseInt(row) - 1, parseInt(col)));
            });

            //some errors only have a position, by default, we set the end postion as {start.row, start.col + 1}
            if (positions.length == 1) {
              positions.push(Position.create(positions[0].line, positions[0].character + 1));
            }

            const range = Range.create(positions[0], positions[1]);
            const diagnostic: Diagnostic = Diagnostic.create(range, msg, DiagnosticSeverity.Error);
            errors.push(diagnostic);
          });
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

  protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
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
