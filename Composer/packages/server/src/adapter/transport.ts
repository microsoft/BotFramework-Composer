// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ChildProcess } from 'child_process';
import readline from 'readline';
import * as net from 'net';
import * as stream from 'stream';
import * as util from 'util';
import * as url from 'url';

import debug from 'debug';
import WebSocket from 'ws';

export const encoding = 'utf8';

export interface Client {
  socket: WebSocket;
  stream: stream.Duplex;
}

export interface IAddress {
  host: string;
  port: number;
}

export const copyStream = async (client: Client, address: IAddress) => {
  const { port } = address;
  const target = await new Promise<net.Socket>(resolve => {
    const s = net.createConnection(port, undefined, () => resolve(s));
  });

  try {
    target.setEncoding(encoding);

    const pipeline = util.promisify(stream.pipeline);

    // consider reusing https://github.com/microsoft/vscode-debugadapter-node/blob/master/adapter/src/protocol.ts#L217
    let chars = '';
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    (target as stream.Duplex).on('data', data => {
      if (typeof data !== 'string') {
        throw new Error();
      }

      chars += data;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const match = /^Content-Length: (\d+)\r\n\r\n/.exec(chars);
        if (match === null) {
          break;
        }

        const charHeader = match[0];
        const byteCount = Number.parseInt(match[1], 10);
        const charRest = chars.substring(charHeader.length);
        const byteRest = encoder.encode(charRest);
        if (byteRest.length < byteCount) {
          break;
        }

        const byteJson = byteRest.subarray(0, byteCount);
        const charJson = decoder.decode(byteJson);
        client.socket.send(charJson);
        chars = chars.substring(charHeader.length + charJson.length);
      }
    });

    const transform = new stream.Transform({
      transform: (chunk, encoding, callback) => {
        const length = Buffer.byteLength(chunk, encoding);
        callback(null, `Content-Length: ${length}\r\n\r\n${chunk}`);
      },
    });

    const forward = pipeline(client.stream, transform, target);

    await Promise.race([forward]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  } finally {
    target.end();
  }
};

export interface ChildOutput {
  started: Promise<url.URL>;
  address: Promise<IAddress>;
}

export const outputFor = (child: ChildProcess, logger: debug.Debugger): ChildOutput => {
  if (child.stdout !== null && child.stderr != null) {
    const stdout = readline.createInterface(child.stdout);
    const stderr = readline.createInterface(child.stderr);

    stdout.on('line', line => logger(line));
    stderr.on('line', line => logger(line));

    const started = new Promise<url.URL>(resolve => {
      stdout.on('line', line => {
        const match = /^Now listening on: (.*)$/.exec(line);
        if (match !== null) {
          const uri = new url.URL(match[1]);
          resolve(uri);
        }
      });
    });

    const address = new Promise<IAddress>(resolve => {
      // copied from https://github.com/microsoft/botbuilder-tools/commit/2d6170084ead8ba1e1a84a0095e29397f060e64f
      stdout.on('line', line => {
        const match = /^DebugTransport\t([^\t]+)\t(\d+)$/.exec(line);
        if (match !== null) {
          const host = match[1];
          const port = Number.parseInt(match[2], 10);
          resolve({ host, port });
        }
      });
    });

    return { started, address };
  }

  throw new Error();
};
