// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import WebSocket from 'ws';

import { startServer } from './helpers/server';
import {
  InitializeParams,
  DidOpenTextDocumentParams,
  CompletionParams,
  DidChangeTextDocumentParams,
  DidChangeConfigurationParams,
} from 'vscode-languageserver';

const ws = new WebSocket('ws://localhost:50002/intellisense-language-server');

type messageResolver = (data) => void;

const subscribers: messageResolver[] = [];

const FIELD_URI = 'intellisense-field';

ws.on('message', (data) => {
  const subscriber = subscribers.shift();
  if (subscriber) {
    subscriber(data);
  }
});

function send(data, resolvers?: messageResolver[]): Promise<any> {
  ws.send(data);
  return new Promise((resolve) => {
    if (typeof resolvers === 'undefined') {
      subscribers.push((data) => {
        resolve(data);
      });
      return;
    }
    if (resolvers.length === 0) {
      resolve();
      return;
    }
    let count = 0;
    const readers = resolvers.map((resolver) => {
      return (data) => {
        count++;
        resolver(JSON.parse(data));
        if (resolvers.length === count) {
          resolve(JSON.parse(data));
        }
      };
    });
    subscribers.push(...readers);
  });
}

describe('Intellisense LSP server test', () => {
  const oldEnv = process.env;
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(() => {
    process.env = oldEnv;
  });
  const server = startServer();
  beforeAll(async () => {
    await new Promise((resolve) => {
      ws.on('open', () => {
        resolve();
      });
    });
  });

  afterAll(async (done) => {
    ws.close();
    server.close();
    done();
  });

  let typedText = '';
  let currentMessageId = 0;
  let currentDocumentVersion = 0;

  it('should connect to server and initialize it successfully', async () => {
    const initializeParams: InitializeParams = {
      rootUri: null,
      capabilities: {},
      workspaceFolders: null,
      processId: null,
      initializationOptions: { scopes: ['user-variables'], projectId: 'abc' },
    };

    await send(
      `{ "jsonrpc":"2.0","id":${currentMessageId},"method":"initialize","params": ${JSON.stringify(
        initializeParams
      )} }`,
      [
        (response) => {
          expect(response.id).toEqual(currentMessageId);
        },
      ]
    );

    currentMessageId += 1;

    // client initialized
    await send(`{"jsonrpc":"2.0","method":"initialized","params":{}}`, []);

    const didOpenTextDocumentParams: DidOpenTextDocumentParams = {
      textDocument: {
        uri: FIELD_URI,
        languageId: 'intellisense',
        version: currentDocumentVersion,
        text: typedText,
      },
    };

    await send(
      `{"jsonrpc":"2.0","method":"textDocument/didOpen","params": ${JSON.stringify(didOpenTextDocumentParams)} }`,
      []
    );
  });

  it('should return correct completion results (based on initial scopes) after typing something', async () => {
    // Scopes are currently ['user-variables'] based on initialization
    typedText = 'user';
    const exampleCorrectResult = 'user.name';
    const exampleIncorrectResult = 'user.';

    currentDocumentVersion += 1;
    const didChangeTextDocumentParams: DidChangeTextDocumentParams = {
      contentChanges: [{ text: typedText }],
      textDocument: {
        uri: FIELD_URI,
        version: currentDocumentVersion,
      },
    };

    await send(
      `{ "jsonrpc":"2.0","method":"textDocument/didChange","params": ${JSON.stringify(didChangeTextDocumentParams)} }`,
      []
    );

    const completionParams: CompletionParams = {
      position: {
        line: 0,
        character: typedText.length,
      },
      textDocument: {
        uri: FIELD_URI,
      },
    };

    await send(
      `{ "jsonrpc":"2.0","id":${currentMessageId},"method":"textDocument/completion","params": ${JSON.stringify(
        completionParams
      )} }`,
      [
        (response) => {
          expect(response.id).toEqual(currentMessageId);

          const items = response.result.items;
          const itemLabels = items.map((item) => item.label);
          expect(itemLabels.indexOf(exampleCorrectResult) >= 0).toBeTruthy;
          expect(itemLabels.indexOf(exampleIncorrectResult) >= 0).toBeFalsy;
        },
      ]
    );

    currentMessageId += 1;
  });

  it('should successfully change scopes configuration and return correct results afterwards', async () => {
    const newScopes = ['variable-scopes'];
    const exampleCorrectResult = 'user';
    const exampleIncorrectResult = 'user.name';

    const didChangeConfigurationParams: DidChangeConfigurationParams = {
      settings: {
        scopes: newScopes,
      },
    };

    await send(
      `{ "jsonrpc":"2.0","method":"workspace/didChangeConfiguration","params": ${JSON.stringify(
        didChangeConfigurationParams
      )} }`,
      []
    );

    const completionParams: CompletionParams = {
      position: {
        line: 0,
        character: typedText.length,
      },
      textDocument: {
        uri: FIELD_URI,
      },
    };

    await send(
      `{ "jsonrpc":"2.0","id":${currentMessageId},"method":"textDocument/completion","params": ${JSON.stringify(
        completionParams
      )} }`,
      [
        (response) => {
          expect(response.id).toEqual(currentMessageId);

          const items = response.result.items;
          const itemLabels = items.map((item) => item.label);
          expect(itemLabels.indexOf(exampleCorrectResult) >= 0).toBeTruthy;
          expect(itemLabels.indexOf(exampleIncorrectResult) >= 0).toBeFalsy;
        },
      ]
    );

    currentMessageId += 1;
  });
});
