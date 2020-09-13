// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CompletionParams,
  DidChangeConfigurationParams,
  DidChangeTextDocumentParams,
  DidOpenTextDocumentParams,
  InitializeParams,
  Position,
} from 'monaco-languageclient';

export const getInitializeMessage = (scopes: string[], projectId?: string) => {
  const params: InitializeParams = {
    rootUri: null,
    capabilities: {},
    workspaceFolders: null,
    processId: null,
    initializationOptions: { scopes, projectId },
  };
  return {
    jsonrpc: '2.0',
    id: 0,
    method: 'initialize',
    params: params,
  };
};

export const getTextDocumentOpenedMessage = (uri: string, languageId: string, version: number, text: string) => {
  const params: DidOpenTextDocumentParams = {
    textDocument: {
      uri,
      languageId,
      version,
      text,
    },
  };
  return {
    jsonrpc: '2.0',
    method: 'textDocument/didOpen',
    params: params,
  };
};

export const getConfigurationChangedMessage = (scopes: string[], projectId?: string) => {
  const params: DidChangeConfigurationParams = {
    settings: {
      scopes: scopes,
      projectId: projectId,
    },
  };
  return {
    jsonrpc: '2.0',
    method: 'workspace/didChangeConfiguration',
    params: params,
  };
};

export const getDocumentChangedMessage = (text: string, uri: string, version: number) => {
  const params: DidChangeTextDocumentParams = {
    contentChanges: [{ text }],
    textDocument: {
      uri,
      version,
    },
  };
  return {
    jsonrpc: '2.0',
    method: 'textDocument/didChange',
    params: params,
  };
};

export const getCompletionRequestMessage = (id: number, uri: string, position: Position) => {
  const params: CompletionParams = {
    position,
    textDocument: {
      uri,
    },
  };
  return {
    id,
    jsonrpc: '2.0',
    method: 'textDocument/completion',
    params: params,
  };
};
