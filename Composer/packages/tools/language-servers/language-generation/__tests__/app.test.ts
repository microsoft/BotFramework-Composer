// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import WebSocket from 'ws';

import { startServer } from './helpers/server';

const lgFile = fs.readFileSync(`${__dirname}/mocks/greeting.lg`, 'utf-8');
const initializeParams = fs.readFileSync(`${__dirname}/mocks/initialize-params.json`, 'utf-8');

const ws = new WebSocket('ws://localhost:50002/lg-language-server');
let reader;
ws.on('message', data => {
  reader(data);
});
function send(data, resolver?): Promise<any> {
  ws.send(data);
  return new Promise(resolve => {
    reader = data => {
      if (resolver) {
        resolver(JSON.parse(data), resolve);
      }
      resolve(JSON.parse(data));
    };
  });
}

function jsonEscape(str) {
  return str
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

const content = jsonEscape(lgFile);

describe('lg lsp server', () => {
  const server = startServer();
  beforeAll(async () => {
    await new Promise(resolve => {
      ws.on('open', () => {
        resolve();
      });
    });
  });

  afterAll(async done => {
    ws.close();
    server.close();
    done();
  });
  it('websocket should connect server', async () => {
    await send(
      `{ "jsonrpc":"2.0","id":0,"method":"initialize","params": ${initializeParams} }`,
      (response, resolve) => {
        if (response.method) {
          expect(response.method).toEqual('window/logMessage');
          expect(response.params.type).toEqual(4);
        } else {
          expect(response.id).toEqual(0);
          resolve();
        }
      }
    );
    // client initialized
    send(`{"jsonrpc":"2.0","method":"initialized","params":{}}`);
    send(
      `{"jsonrpc":"2.0","method":"textDocument/didOpen","params": {"textDocument":{"uri":"inmemory://model/1","languageId":"botbuilderlg","version":2,"text": "${content}" }}}`
    );
    await new Promise(resolve => setTimeout(() => resolve(), 10));
  });

  it('initialize documents', async () => {
    // initialize, check diagnostics
    await send(
      `{"jsonrpc":"2.0","id":1,"method":"initializeDocuments","params":{"uri":"inmemory://model/1"}}`,
      (response, resolve) => {
        if (response.method) {
          expect(response.method).toEqual('textDocument/publishDiagnostics');
          expect(response.params.diagnostics.length).toEqual(0);
        } else {
          expect(response.id).toEqual(1);
          resolve();
        }
      }
    );
  });

  it('hover', async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 10));
    // didChange
    const response = await send(
      `{"jsonrpc":"2.0","id":2,"method":"textDocument/hover","params":{"textDocument":{"uri":"inmemory://model/1"},"position":{"line":6,"character":6}}}`
    );
    expect(response.id).toEqual(2);
    expect(response.result.contents[0]).toEqual('-Good evening');
  });

  it('didChange', async () => {
    // didChange
    const newContent = `${content}-@{G\\r\\n`;
    const payload = `{"jsonrpc":"2.0","method":"textDocument/didChange","params":{"textDocument":{"uri":"inmemory://model/1","version":3},"contentChanges":[{"text": "${newContent}"}]}}`;
    const response = await send(payload);
    expect(response.method).toEqual('textDocument/publishDiagnostics');
    expect(response.params.diagnostics.length).toEqual(0);
  });

  it('completion', async () => {
    // completion,
    // input G, should suggest Greeting*
    const payload = `{"jsonrpc":"2.0","id":3,"method":"textDocument/completion","params":{"textDocument":{"uri":"inmemory://model/1"},"position":{"line":8,"character":4},"context":{"triggerKind":1}}}`;
    const response = await send(payload);
    expect(response.id).toEqual(3);
    expect(
      response.result.items
        .slice(0, 3)
        .map(item => item.label)
        .join(',')
    ).toEqual(['Greeting1', 'Greeting2', 'Greeting3'].join(','));
  });
});
