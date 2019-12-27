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
} from 'vscode-languageserver-types';
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';
import * as lg from 'botbuilder-lg';
import { buildInfunctionsMap } from './builtinFunctions';
import { getRangeAtPosition, convertSeverity, getLGResources } from './utils';

export function start(reader: MessageReader, writer: MessageWriter): LgServer {
  const connection = createConnection(reader, writer);
  const server = new LgServer(connection);
  server.start();
  return server;
}

export class LgServer {
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
    const lgResources = getLGResources(document);
    const templates = lgResources.Templates;
    const wordRange = getRangeAtPosition(document, params.position);
    let word = document.getText(wordRange);
    const matchItem: lg.LGTemplate = templates.find(u => u.Name === word);
    if (matchItem !== undefined) {
      const hoveritem: Hover = { contents: [matchItem.Source, matchItem.Body] };
      return Promise.resolve(hoveritem);
    }
    if (word.indexOf('builtin.') == 0) {
      word = word.substring('builtin.'.length);
    }

    if (buildInfunctionsMap.has(word)) {
      const functionEntity = buildInfunctionsMap.get(word);
      const hoveritem: Hover = {
        contents: [
          `Parameters: ${functionEntity.Params.join(', ')}`,
          `Documentation: ${functionEntity.Introduction}`,
          `ReturnType: ${functionEntity.Returntype.valueOf()}`,
        ],
      };
      return Promise.resolve(hoveritem);
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

  private removeParamFormat(params: string): string {
    const paramArr: string[] = params.split(',');
    const resultArr: string[] = [];
    paramArr.forEach(element => {
      resultArr.push(element.trim().split(':')[0]);
    });
    return resultArr.join(' ,');
  }

  private matchedStates(params: TextDocumentPositionParams): { matched: boolean; state: string } {
    const state: string[] = [];
    const document = this.documents.get(params.textDocument.uri);
    const position = params.position;
    const range = Range.create(position.line, 0, position.line, position.character);
    const lineContent = document.getText(range);
    let flag = false;
    let finalState = '';
    if (lineContent.trim().indexOf('-') !== 0) {
      return { matched: flag, state: finalState };
    }

    //if the line starts with '-', will try to match
    flag = true;
    //initilize the state to plaintext
    state.push('PlainText');
    let i = 0;
    while (i < lineContent.length) {
      let char = lineContent.charAt(i);
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
      i = i + 1;
    }
    finalState = state[state.length - 1];
    return { matched: flag, state: finalState };
  }

  protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null> {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const lgResources = getLGResources(document);
    const templates = lgResources.Templates;
    const completionList = [];
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
        insertText: key + '(' + this.removeParamFormat(value.Params.toString()) + ')',
        documentation: value.Introduction,
      };
      completionList.push(item);
    });

    const match = this.matchedStates(params);
    if (match.matched && match.state === 'expression') {
      return Promise.resolve({ isIncomplete: true, items: completionList });
    } else {
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

    let text = document.getText();
    const staticChercher = new lg.StaticChecker();
    const lgDiags = staticChercher.checkText(text, '', lg.ImportResolver.fileResolver);
    let diagnostics: Diagnostic[] = [];
    lgDiags.forEach(diag => {
      let diagnostic: Diagnostic = {
        severity: convertSeverity(diag.Severity),
        range: {
          start: Position.create(diag.Range.Start.Line - 1, diag.Range.Start.Character),
          end: Position.create(diag.Range.End.Line - 1, diag.Range.End.Character),
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
