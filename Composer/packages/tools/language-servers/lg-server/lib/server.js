'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
const fs = require('fs');
const request_light_1 = require('request-light');
const vscode_uri_1 = require('vscode-uri');
const vscode_languageserver_1 = require('vscode-languageserver');
const vscode_languageserver_types_1 = require('vscode-languageserver-types');
const lg = require('botbuilder-lg');
const builtinFunctions_1 = require('./builtinFunctions');
const utils_1 = require('./utils');
function start(reader, writer) {
  const connection = vscode_languageserver_1.createConnection(reader, writer);
  const server = new LgServer(connection);
  server.start();
  return server;
}
exports.start = start;
class LgServer {
  constructor(connection) {
    this.connection = connection;
    this.documents = new vscode_languageserver_1.TextDocuments();
    // protected readonly jsonService: LanguageService = getLanguageService({
    //     schemaRequestService: this.resovleSchema.bind(this)
    // });
    this.pendingValidationRequests = new Map();
    this.documents.listen(this.connection);
    this.documents.onDidChangeContent(change => this.validate(change.document));
    this.documents.onDidClose(event => {
      this.cleanPendingValidation(event.document);
      this.cleanDiagnostics(event.document);
    });
    this.connection.onInitialize(params => {
      if (params.rootPath) {
        this.workspaceRoot = vscode_uri_1.URI.file(params.rootPath);
      } else if (params.rootUri) {
        this.workspaceRoot = vscode_uri_1.URI.parse(params.rootUri);
      }
      this.connection.console.log('The server is initialized.');
      return {
        capabilities: {
          textDocumentSync: this.documents.syncKind,
          codeActionProvider: true,
          completionProvider: {
            resolveProvider: true,
          },
          hoverProvider: true,
          documentSymbolProvider: true,
          documentRangeFormattingProvider: true,
          // executeCommandProvider: {
          //     commands: ['json.documentUpper']
          // },
          colorProvider: true,
          foldingRangeProvider: false,
        },
      };
    });
    // this.connection.onCodeAction(params =>
    //     this.codeAction(params)
    // );
    this.connection.onCompletion(params => this.completion(params));
    // this.connection.onCompletionResolve(item =>
    //     this.resolveCompletion(item)
    // );
    // this.connection.onExecuteCommand(params =>
    //     this.executeCommand(params)
    // );
    this.connection.onHover(params => this.hover(params));
    // this.connection.onDocumentSymbol(params =>
    //     this.findDocumentSymbols(params)
    // );
    // this.connection.onDocumentRangeFormatting(params =>
    //     this.format(params)
    // );
    // this.connection.onDocumentColor(params =>
    //     this.findDocumentColors(params)
    // );
    // this.connection.onColorPresentation(params =>
    //     this.getColorPresentations(params)
    // );
    // this.connection.onFoldingRanges(params =>
    //     this.getFoldingRanges(params)
    // );
  }
  start() {
    this.connection.listen();
  }
  // protected getFoldingRanges(params: FoldingRangeRequestParam): FoldingRange[] {
  //     const document = this.documents.get(params.textDocument.uri);
  //     if (!document) {
  //         return [];
  //     }
  //     return this.jsonService.getFoldingRanges(document);
  // }
  // protected findDocumentColors(params: DocumentColorParams): Thenable<ColorInformation[]> {
  //     const document = this.documents.get(params.textDocument.uri);
  //     if (!document) {
  //         return Promise.resolve([]);
  //     }
  //     const jsonDocument = this.getJSONDocument(document);
  //     return this.jsonService.findDocumentColors(document, jsonDocument);
  // }
  // protected getColorPresentations(params: ColorPresentationParams): ColorPresentation[] {
  //     const document = this.documents.get(params.textDocument.uri);
  //     if (!document) {
  //         return [];
  //     }
  //     const jsonDocument = this.getJSONDocument(document);
  //     return this.jsonService.getColorPresentations(document, jsonDocument, params.color, params.range);
  // }
  // protected codeAction(params: CodeActionParams): Command[] {
  //     const document = this.documents.get(params.textDocument.uri);
  //     if (!document) {
  //         return [];
  //     }
  //     return [{
  //         title: "Upper Case Document",
  //         command: "json.documentUpper",
  //         // Send a VersionedTextDocumentIdentifier
  //         arguments: [{
  //             ...params.textDocument,
  //             version: document.version
  //         }]
  //     }];
  // }
  // protected format(params: DocumentRangeFormattingParams): TextEdit[] {
  //     const document = this.documents.get(params.textDocument.uri);
  //     return document ? this.jsonService.format(document, params.range, params.options) : [];
  // }
  // protected findDocumentSymbols(params: any): SymbolInformation[] {
  //     const document = this.documents.get(params.textDocument.uri);
  //     if (!document) {
  //         return [];
  //     }
  //     const jsonDocument = this.getJSONDocument(document);
  //     return this.jsonService.findDocumentSymbols(document, jsonDocument);
  // }
  // protected executeCommand(params: ExecuteCommandParams): any {
  //     if (params.command === "json.documentUpper" && params.arguments) {
  //         const versionedTextDocumentIdentifier = params.arguments[0];
  //         const document = this.documents.get(versionedTextDocumentIdentifier.uri);
  //         if (document) {
  //             this.connection.workspace.applyEdit({
  //                 documentChanges: [{
  //                     textDocument: versionedTextDocumentIdentifier,
  //                     edits: [{
  //                         range: {
  //                             start: { line: 0, character: 0 },
  //                             end: { line: Number.MAX_SAFE_INTEGER, character: Number.MAX_SAFE_INTEGER }
  //                         },
  //                         newText: document.getText().toUpperCase()
  //                     }]
  //                 }]
  //             });
  //         }
  //     }
  // }
  hover(params) {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const lgResources = utils_1.getLGResources(document);
    const templates = lgResources.Templates;
    const hoverItemList = [];
    const wordRange = utils_1.getRangeAtPosition(document, params.position);
    let word = document.getText(wordRange);
    const matchItem = templates.find(u => u.Name === word);
    if (matchItem !== undefined) {
      const hoveritem = { contents: [matchItem.Source, matchItem.Body] };
      return Promise.resolve(hoveritem);
    }
    if (word.indexOf('builtin.') == 0) {
      word = word.substring('builtin.'.length);
    }
    if (builtinFunctions_1.buildInfunctionsMap.has(word)) {
      const functionEntity = builtinFunctions_1.buildInfunctionsMap.get(word);
      const hoveritem = {
        contents: [
          `Parameters: ${functionEntity.Params.join(', ')}`,
          `Documentation: ${functionEntity.Introduction}`,
          `ReturnType: ${functionEntity.Returntype.valueOf()}`,
        ],
      };
      return Promise.resolve(hoveritem);
    }
  }
  async resovleSchema(url) {
    const uri = vscode_uri_1.URI.parse(url);
    if (uri.scheme === 'file') {
      return new Promise((resolve, reject) => {
        fs.readFile(uri.fsPath, 'UTF-8', (err, result) => {
          err ? reject('') : resolve(result.toString());
        });
      });
    }
    try {
      const response = await request_light_1.xhr({ url, followRedirects: 5 });
      return response.responseText;
    } catch (error) {
      return Promise.reject(
        error.responseText || request_light_1.getErrorStatusDescription(error.status) || error.toString()
      );
    }
  }
  // protected resolveCompletion(item: CompletionItem): Thenable<CompletionItem> {
  //     return this.jsonService.doResolve(item);
  // }
  completion(params) {
    const document = this.documents.get(params.textDocument.uri);
    if (!document) {
      return Promise.resolve(null);
    }
    const lgResources = utils_1.getLGResources(document);
    const templates = lgResources.Templates;
    const completionList = [];
    templates.forEach(template => {
      const item = {
        label: template.Name,
        kind: vscode_languageserver_types_1.CompletionItemKind.Reference,
        insertText:
          template.Parameters.length > 0 ? template.Name + '(' + template.Parameters.join(', ') + ')' : template.Name,
        documentation: template.Body,
      };
      completionList.push(item);
    });
    builtinFunctions_1.buildInfunctionsMap.forEach((value, key) => {
      const item = {
        label: key,
        kind: vscode_languageserver_types_1.CompletionItemKind.Function,
        insertText: key + '(' + value.Params.toString() + ')',
        documentation: value.Introduction,
      };
      completionList.push(item);
    });
    return Promise.resolve({ isIncomplete: true, items: completionList });
    //return this.jsonService.doComplete(document, params.position, jsonDocument);
  }
  validate(document) {
    this.cleanPendingValidation(document);
    this.pendingValidationRequests.set(
      document.uri,
      setTimeout(() => {
        this.pendingValidationRequests.delete(document.uri);
        this.doValidate(document);
      })
    );
  }
  cleanPendingValidation(document) {
    const request = this.pendingValidationRequests.get(document.uri);
    if (request !== undefined) {
      clearTimeout(request);
      this.pendingValidationRequests.delete(document.uri);
    }
  }
  doValidate(document) {
    if (document.getText().length === 0) {
      this.cleanDiagnostics(document);
      return;
    }
    //const jsonDocument = this.getJSONDocument(document);
    // this.jsonService.doValidation(document, jsonDocument).then(diagnostics =>
    //     this.sendDiagnostics(document, diagnostics)
    // );
    let text = document.getText();
    const staticChercher = new lg.StaticChecker();
    const lgDiags = staticChercher.checkText(text, '', lg.ImportResolver.fileResolver);
    let diagnostics = [];
    lgDiags.forEach(diag => {
      let diagnostic = {
        severity: utils_1.convertSeverity(diag.Severity),
        range: {
          start: vscode_languageserver_types_1.Position.create(diag.Range.Start.Line, diag.Range.Start.Character),
          end: vscode_languageserver_types_1.Position.create(diag.Range.End.Line, diag.Range.End.Character),
        },
        message: diag.Message,
        source: document.uri,
      };
      diagnostics.push(diagnostic);
    });
    this.sendDiagnostics(document, diagnostics);
  }
  cleanDiagnostics(document) {
    this.sendDiagnostics(document, []);
  }
  sendDiagnostics(document, diagnostics) {
    this.connection.sendDiagnostics({
      uri: document.uri,
      diagnostics,
    });
  }
}
exports.LgServer = LgServer;
//# sourceMappingURL=server.js.map
