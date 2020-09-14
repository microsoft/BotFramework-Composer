import { CompletionParams, DidChangeConfigurationParams, DidChangeTextDocumentParams, DidOpenTextDocumentParams, InitializeParams, Position } from 'monaco-languageclient';
export declare const getInitializeMessage: (scopes: string[], projectId?: string | undefined) => {
    jsonrpc: string;
    id: number;
    method: string;
    params: InitializeParams;
};
export declare const getTextDocumentOpenedMessage: (uri: string, languageId: string, version: number, text: string) => {
    jsonrpc: string;
    method: string;
    params: DidOpenTextDocumentParams;
};
export declare const getConfigurationChangedMessage: (scopes: string[], projectId?: string | undefined) => {
    jsonrpc: string;
    method: string;
    params: DidChangeConfigurationParams;
};
export declare const getDocumentChangedMessage: (text: string, uri: string, version: number) => {
    jsonrpc: string;
    method: string;
    params: DidChangeTextDocumentParams;
};
export declare const getCompletionRequestMessage: (id: number, uri: string, position: Position) => {
    id: number;
    jsonrpc: string;
    method: string;
    params: CompletionParams;
};
//# sourceMappingURL=lspMessagesUtils.d.ts.map