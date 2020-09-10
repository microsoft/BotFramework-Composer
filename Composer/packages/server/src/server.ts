// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import 'dotenv/config';
import path from 'path';
import crypto from 'crypto';

import { getPortPromise } from 'portfinder';
import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import compression from 'compression';
import * as ws from 'ws';
import * as rpc from 'vscode-ws-jsonrpc';
import { IConnection, createConnection } from 'vscode-languageserver';
import { IntellisenseServer } from '@bfc/intellisense-languageserver';
import { LGServer } from '@bfc/lg-languageserver';
import { LUServer } from '@bfc/lu-languageserver';
import { pluginLoader, PluginManager } from '@bfc/plugin-loader';
import chalk from 'chalk';

import { BotProjectService } from './services/project';
import { getAuthProvider } from './router/auth';
import { apiRouter } from './router/api';
import { BASEURL } from './constants';
import { attachLSPServer } from './utility/attachLSP';
import log from './logger';
import { setEnvDefault } from './utility/setEnvDefault';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const session = require('express-session');

export async function start(): Promise<number | string> {
  const clientDirectory = path.resolve(require.resolve('@bfc/client'), '..');
  const app: Express = express();
  app.set('view engine', 'ejs');
  app.set('view options', { delimiter: '?' });
  app.use(compression());

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({ secret: 'bot-framework-composer' }));
  app.use(pluginLoader.passport.initialize());
  app.use(pluginLoader.passport.session());

  // make sure plugin has access to our express...
  pluginLoader.useExpress(app);

  // load all installed plugins
  setEnvDefault('COMPOSER_EXTENSION_DATA', path.resolve(__dirname, '../extensions.json'));
  setEnvDefault('COMPOSER_BUILTIN_PLUGINS_DIR', path.resolve(__dirname, '../../../plugins'));
  setEnvDefault('COMPOSER_REMOTE_PLUGINS_DIR', path.resolve(__dirname, '../../../.composer'));
  await PluginManager.loadBuiltinPlugins();
  // TODO (toanzian / abrown): load 3P plugins

  const { login, authorize } = getAuthProvider();

  const CS_POLICIES = [
    "default-src 'none';",
    "font-src 'self' https:;",
    "img-src 'self' data:;",
    "base-uri 'none';",
    "connect-src 'self';",
    "frame-src 'self' bfemulator: https://login.microsoftonline.com https://*.botframework.com;",
    "worker-src 'self';",
    "form-action 'none';",
    "frame-ancestors 'self';",
    "manifest-src 'self';",
    'upgrade-insecure-requests;',
  ];

  app.all('*', (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (process.env.ENABLE_CSP === 'true') {
      req.__nonce__ = crypto.randomBytes(16).toString('base64');
      res.header(
        'Content-Security-Policy',
        CS_POLICIES.concat([
          `script-src 'self' 'nonce-${req.__nonce__}';`,
          // TODO: use nonce strategy after addressing issues with monaco-editor pacakge
          "style-src 'self' 'unsafe-inline'",
          // `style-src 'self' 'nonce-${req.__nonce__}';`,
        ]).join(' ')
      );
    }

    next();
  });

  app.use(`${BASEURL}/`, express.static(clientDirectory, { immutable: true, maxAge: 31536000 }));
  app.use(morgan('dev'));

  // only register the login route if the auth provider defines one
  if (login) {
    app.get(`${BASEURL}/api/login`, login);
  } else {
    // register the route so that client that requires_auth knows not try repeatedly
    app.get(`${BASEURL}/api/login`, (req, res) => {
      res.redirect(`${BASEURL}#error=${encodeURIComponent('NoSupport')}`);
    });
  }

  // always authorize all api routes, it will be a no-op if no auth provider set
  app.use(`${BASEURL}/api`, authorize, apiRouter);

  // next needs to be an arg in order for express to recognize this as the error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err) {
      log(err);
      res.status(500).json({ message: err.message });
    }
  });

  app.get('*', (req, res) => {
    res.render(path.resolve(clientDirectory, 'index.ejs'), { __nonce__: req.__nonce__ });
  });

  const preferredPort = process.env.PORT || 5000;
  let port = preferredPort;
  if (process.env.NODE_ENV === 'production') {
    // Dynamically search for an open PORT starting with PORT or 5000, so that
    // the app doesn't crash if the port is already being used.
    // (disabled in dev in order to avoid breaking the webpack dev server proxy)
    port = await getPortPromise({ port: preferredPort as number });
  }
  let server;
  await new Promise((resolve) => {
    server = app.listen(port, () => {
      if (process.env.NODE_ENV === 'production') {
        // We don't use the debug logger here because we always want it to be shown.
        // eslint-disable-next-line no-console
        console.log(`\n\n${chalk.green('Composer now running at:')}\n\n${chalk.blue(`http://localhost:${port}`)}\n`);
      }
      resolve();
    });
  });

  const wss: ws.Server = new ws.Server({
    noServer: true,
    perMessageDeflate: false,
  });

  const { getLgResources, luImportResolver, staticMemoryResolver } = BotProjectService;

  function launchLanguageServer(socket: rpc.IWebSocket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    const connection: IConnection = createConnection(reader, writer);
    const server = new LGServer(connection, getLgResources, staticMemoryResolver);
    server.start();
  }

  function launchLuLanguageServer(socket: rpc.IWebSocket) {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    const connection: IConnection = createConnection(reader, writer);
    const server = new LUServer(connection, luImportResolver);
    server.start();
  }

  const launchIntellisenseLanguageServer = (socket: rpc.IWebSocket) => {
    const reader = new rpc.WebSocketMessageReader(socket);
    const writer = new rpc.WebSocketMessageWriter(socket);
    const connection: IConnection = createConnection(reader, writer);
    const server = new IntellisenseServer(connection, staticMemoryResolver);
    server.start();
  };

  attachLSPServer(wss, server, '/lg-language-server', (webSocket) => {
    // launch language server when the web socket is opened
    if (webSocket.readyState === webSocket.OPEN) {
      launchLanguageServer(webSocket);
    } else {
      webSocket.on('open', () => {
        launchLanguageServer(webSocket);
      });
    }
  });

  attachLSPServer(wss, server, '/lu-language-server', (webSocket) => {
    // launch language server when the web socket is opened
    if (webSocket.readyState === webSocket.OPEN) {
      launchLuLanguageServer(webSocket);
    } else {
      webSocket.on('open', () => {
        launchLuLanguageServer(webSocket);
      });
    }
  });

  attachLSPServer(wss, server, '/intellisense-language-server', (webSocket) => {
    if (webSocket.readyState === webSocket.OPEN) {
      launchIntellisenseLanguageServer(webSocket);
    } else {
      webSocket.on('open', () => {
        launchIntellisenseLanguageServer(webSocket);
      });
    }
  });

  return port;
}
