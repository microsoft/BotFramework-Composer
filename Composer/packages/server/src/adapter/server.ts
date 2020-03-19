// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { spawn } from 'child_process';
import * as http from 'http';

import debug from 'debug';
import WebSocket from 'ws';

import * as connection from '../../../client/src/adapter/connection';

import * as transport from './transport';

export interface Child extends transport.ChildOutput {
  process: Promise<unknown>;
}

export const runAdaptive = async (debug: debug.Debugger): Promise<Child> => {
  const endpoint = 'http://localhost:3979';
  const child = spawn(
    'dotnet',
    [
      'bin/Debug/netcoreapp2.1/BotProject.dll',
      `--urls`,
      endpoint,
      '--MicrosoftAppPassword',
      '',
      '--luis:endpointKey',
      '752a2d86f21e47879c8e3ae88ca4c009',
      '--luis:endpoint',
      'https://westus.api.cognitive.microsoft.com/',
    ],
    {
      cwd: 'C:/Users/wportnoy/Documents/Composer/ToDoBotWithLuisSample-0/',
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  const process = new Promise<unknown>((resolve, reject) => {
    for (const name of child.eventNames()) {
      if (typeof name === 'string') {
        child.on(name, (...args: Array<unknown>) => resolve(args));
      }
    }
  });

  const logger = debug.extend(`process (${child.pid})`);
  const output = transport.outputFor(child, logger);

  await output.started;

  // poke the bot to instantiate the debug adapter
  await http.get(`${endpoint}/api/messages`);

  return { process, ...output };
};

export const runServer = async () => {
  try {
    const { port } = connection;
    const wss = new WebSocket.Server({ port });

    const { process, address } = await runAdaptive(debug('root'));

    const client = await new Promise<transport.Client>(resolve =>
      wss.on('connection', socket => {
        const stream = WebSocket.createWebSocketStream(socket, {});
        resolve({ socket, stream });
      })
    );

    const protocol = transport.copyStream(client, await address);

    await Promise.race([process, protocol]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

runServer();
