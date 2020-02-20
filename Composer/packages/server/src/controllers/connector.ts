// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import merge from 'lodash/merge';

import { BotEnvironments } from '../models/connector';
import { BotProjectService } from '../services/project';
import { PluginLoader } from '../services/pluginLoader';

async function connect(req: any, res: any) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);

  try {
    const hostName = req.hostname;
    const env: BotEnvironments = req.query && req.query.botEnvironment ? req.query.botEnvironment : 'production';
    const environment = currentProject?.environment;
    const botEndpoint = await environment?.getBotConnector().connect(env || 'production', hostName);
    res.send({ botEndpoint });
  } catch (error) {
    res.status(400).json({
      message: error.message || 'cannot connect to a bot runtime, make sure you start the bot runtime',
    });
  }
}

async function getPublishHistory(req: any, res: any) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);

  try {
    const environment = currentProject?.environment;
    const history = await environment?.getBotConnector().getPublishHistory();
    res.send(history);
  } catch (error) {
    res.status(400).json({
      message: 'Unable to get publish versions: ' + (error instanceof Error ? error.message : error),
    });
  }
}

async function sync(req: any, res: any) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);

  try {
    const environment = currentProject?.environment;
    const settingsInDisk = await environment?.getSettingsManager().get();
    await environment?.getBotConnector().sync(merge({}, settingsInDisk, req.body, { user: req.user }));
    res.send('OK');
  } catch (error) {
    console.log('ERROR IN SYNC', error);
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

async function publish(req: any, res: any) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);

  try {
    const label = req.params ? req.params.label : undefined;
    const environment = currentProject?.environment;
    await environment?.getBotConnector().publish({ ...req.body, user: req.user }, label);
    res.send('OK');
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : error,
    });
  }
}

async function status(req: any, res: any) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);

  const environment = currentProject?.environment;
  res.send(environment?.getBotConnector().status);
}

export const BotConnectorController = {
  connect: connect,
  sync: sync,
  status: status,
  publish: publish,
  getPublishHistory: getPublishHistory,
};
