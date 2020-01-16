// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import fs from 'fs';

import WebSocket from 'ws';

import { startServer } from './helpers/server';

const luFile = fs.readFileSync(`${__dirname}/mocks/greeting.lu`, 'utf-8');
const initializeParams = fs.readFileSync(`${__dirname}/mocks/initialize-params.json`, 'utf-8');

const ws = new WebSocket('ws://localhost:50003/lu-language-server');

type messageResolver = (data) => void;

const subscribers: messageResolver[] = [];

ws.on('message', data => {
  const subscriber = subscribers.shift();
  if (subscriber) {
    subscriber(data);
  }
});

function send(data, resolvers?: messageResolver[]): Promise<any> {
  ws.send(data);
  return new Promise(resolve => {
    if (typeof resolvers === 'undefined') {
      subscribers.push(data => {
        resolve(data);
      });
      return;
    }
    if (resolvers.length === 0) {
      resolve();
      return;
    }
    let count = 0;
    const readers = resolvers.map(resolver => {
      return data => {
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
  return str
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

const content = jsonEscape(luFile);

describe('lu lsp server', () => {
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
    await send(`{ "jsonrpc":"2.0","id":0,"method":"initialize","params": ${initializeParams} }`, [
      response => {
        expect(response.method).toEqual('window/logMessage');
        expect(response.params.type).toEqual(4);
      },
      response => {
        expect(response.id).toEqual(0);
      },
    ]);
    // client initialized
    await send(`{"jsonrpc":"2.0","method":"initialized","params":{}}`, []);
    await send(
      `{"jsonrpc":"2.0","method":"textDocument/didOpen","params": {"textDocument":{"uri":"inmemory://model/1","languageId":"lu","version":2,"text": "${content}" }}}`,
      []
    );
  });
});
