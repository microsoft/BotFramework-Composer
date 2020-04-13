// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { pluginLoader, PluginLoader } from '../services/pluginLoader';
import { BotProjectService } from '../services/project';
import { copyDir } from '../utility/storage';
import { LocalDiskStorage } from '../models/storage/localDiskStorage';

export const EjectController = {
  getTemplates: async (req, res) => {
    res.json(pluginLoader.extensions.runtimeTemplates);
  },
  eject: async (req, res) => {
    const user = await PluginLoader.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    console.log('eject!', currentProject.id, req.params.template);

    let source = pluginLoader.extensions.runtimeTemplates.filter(i => i.name === req.params.template);

    if (source.length) {
      const template = source[0];
      console.log('SOURCE OF TEMPLATE', source[0]);
      // TODO: ensure that it does not already exist before copying!!
      const fileStorage = new LocalDiskStorage();
      await copyDir(template.path, fileStorage, currentProject.dir + '/runtime', currentProject.fileStorage);
      res.json({
        message: 'success',
      });
    } else {
      res.status(404).json({ message: 'template not found' });
    }
  },
};
