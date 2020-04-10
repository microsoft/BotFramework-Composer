// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { pluginLoader, PluginLoader } from '../services/pluginLoader';
import { BotProjectService } from '../services/project';

export const EjectController = {
  getTemplates: async (req, res) => {
    res.json(pluginLoader.extensions.runtimeTemplates);
  },
  eject: async (req, res) => {
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    console.log('eject!', currentProject.id, req.params.template);
  },
};
