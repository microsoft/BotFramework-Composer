// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import WebSocket from 'ws';

import { startServer } from './helpers/server';

const lgFile = fs.readFileSync(`${__dirname}/mocks/greeting.lg`, 'utf-8');
const initializeParams = fs.readFileSync(`${__dirname}/mocks/initialize-params.json`, 'utf-8');

const ws = new WebSocket('ws://localhost:50002/lg-language-server');

type messageResolver = (data) => void;

const subscribers: messageResolver[] = [];

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

function jsonEscape(str) {
  return str.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

const content = jsonEscape(lgFile);

describe('LG LSP server test', () => {
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
  it('websocket should connect server', async () => {
    await send(`{ "jsonrpc":"2.0","id":0,"method":"initialize","params": ${initializeParams} }`, [
      (response) => {
        expect(response.method).toEqual('window/logMessage');
        expect(response.params.type).toEqual(4);
      },
      (response) => {
        expect(response.id).toEqual(0);
      },
    ]);
    // client initialized
    await send(`{"jsonrpc":"2.0","method":"initialized","params":{}}`, []);
    await send(
      `{"jsonrpc":"2.0","method":"textDocument/didOpen","params": {"textDocument":{"uri":"inmemory://model/1","languageId":"botbuilderlg","version":2,"text": "${content}" }}}`,
      []
    );
  });

  it('should initialize documents', async () => {
    // initialize, check diagnostics
    await send(`{"jsonrpc":"2.0","id":1,"method":"initializeDocuments","params":{"uri":"inmemory://model/1"}}`, [
      (response) => {
        expect(response.id).toEqual(1);
      },
      (response) => {
        expect(response.method).toEqual('textDocument/publishDiagnostics');
        expect(response.params.diagnostics.length).toEqual(0);
      },
    ]);
  });

  it('hover on template name should return template body text', async () => {
    // didChange
    await send(
      `{"jsonrpc":"2.0","id":2,"method":"textDocument/hover","params":{"textDocument":{"uri":"inmemory://model/1"},"position":{"line":6,"character":6}}}`,
      [
        (response) => {
          expect(response.id).toEqual(2);
          expect(response.result.contents[0]).toContain('-Good evening');
        },
      ]
    );
  });

  it('diagnostics, if typing content is invalid should return error', async () => {
    // didChange
    const newContent = `${content}-\${G\\r\\n`;
    const payload = `{"jsonrpc":"2.0","method":"textDocument/didChange","params":{"textDocument":{"uri":"inmemory://model/1","version":3},"contentChanges":[{"text": "${newContent}"}]}}`;
    await send(payload, [
      (response) => {
        expect(response.method).toEqual('textDocument/publishDiagnostics');
        expect(response.params.diagnostics.length).toEqual(1);
      },
    ]);
  });

  it('completion, typing in an expression block should suggest existed templates', async () => {
    // completion,
    // input G, should suggest Greeting*
    const payload = `{"jsonrpc":"2.0","id":3,"method":"textDocument/completion","params":{"textDocument":{"uri":"inmemory://model/1"},"position":{"line":8,"character":4},"context":{"triggerKind":1}}}`;
    await send(payload, [
      (response) => {
        expect(response.id).toEqual(3);
        expect(
          response.result.items
            .slice(0, 3)
            .map((item) => item.label)
            .join(',')
        ).toEqual(['Greeting1', 'Greeting2', 'Greeting3'].join(','));
      },
    ]);
  });

  it('close documents should clean all diagnostics', async () => {
    const payload = `{"jsonrpc":"2.0","method":"textDocument/didClose","params":{"textDocument":{"uri":"inmemory://model/1"}}}`;
    await send(payload, [
      (response) => {
        expect(response.method).toEqual('textDocument/publishDiagnostics');
        expect(response.params.diagnostics.length).toEqual(0);
      },
    ]);
  });
});
