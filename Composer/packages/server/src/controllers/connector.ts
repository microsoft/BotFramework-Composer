/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import { BotEnvironments } from '../models/connector';
import { EnvironmentProvider } from '../models/environment';

async function connect(req: any, res: any) {
  try {
    const hostName = req.hostname;
    const env: BotEnvironments = req.query && req.query.botEnvironment ? req.query.botEnvironment : 'production';
    const environment = EnvironmentProvider.getCurrent();
    const botEndpoint = await environment.getBotConnector().connect(env || 'production', hostName);
    res.send({ botEndpoint });
  } catch (error) {
    res.status(400).json({
      message: 'cannot connect to a bot runtime, make sure you start the bot runtime',
    });
  }
}

async function getPublishHistory(req: any, res: any) {
  try {
    const environment = EnvironmentProvider.getCurrent();
    const history = await environment.getBotConnector().getPublishHistory();
    res.send(history);
  } catch (error) {
    res.status(400).json({
      message: 'Unable to get publish versions: ' + (error instanceof Error ? error.message : error),
    });
  }
}

async function sync(req: any, res: any) {
  try {
    const environment = EnvironmentProvider.getCurrent();
    await environment.getBotConnector().sync({ ...req.body, user: req.user });
    res.send('OK');
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

async function publish(req: any, res: any) {
  try {
    const label = req.params ? req.params.label : undefined;
    const environment = EnvironmentProvider.getCurrent();
    await environment.getBotConnector().publish({ ...req.body, user: req.user }, label);
    res.send('OK');
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

function status(req: any, res: any) {
  const environment = EnvironmentProvider.getCurrent();
  res.send(environment.getBotConnector().status);
}

export const BotConnectorController = {
  connect: connect,
  sync: sync,
  status: status,
  publish: publish,
  getPublishHistory: getPublishHistory,
};
