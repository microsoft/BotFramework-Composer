import { URI } from 'vscode-uri';
import { MessageReader, MessageWriter } from 'vscode-jsonrpc';
import { IConnection, TextDocuments } from 'vscode-languageserver';
import { TextDocument, Diagnostic, CompletionList, Hover } from 'vscode-languageserver-types';
import { TextDocumentPositionParams } from 'vscode-languageserver-protocol';
export declare function start(reader: MessageReader, writer: MessageWriter): LgServer;
export declare class LgServer {
  protected readonly connection: IConnection;
  protected workspaceRoot: URI | undefined;
  protected readonly documents: TextDocuments;
  protected readonly pendingValidationRequests: Map<string, number>;
  constructor(connection: IConnection);
  start(): void;
  protected hover(params: TextDocumentPositionParams): Thenable<Hover | null>;
  protected resovleSchema(url: string): Promise<string>;
  protected completion(params: TextDocumentPositionParams): Thenable<CompletionList | null>;
  protected validate(document: TextDocument): void;
  protected cleanPendingValidation(document: TextDocument): void;
  protected doValidate(document: TextDocument): void;
  protected cleanDiagnostics(document: TextDocument): void;
  protected sendDiagnostics(document: TextDocument, diagnostics: Diagnostic[]): void;
}
