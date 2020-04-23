// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

import { pluginLoader, PluginLoader } from '@bfc/plugin-loader';

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

    const source = pluginLoader.extensions.runtimeTemplates.filter(i => i.key === req.params.template);
    if (source.length) {
      const template = source[0];
      const runtimePath = path.join(currentProject.dir, 'runtime');
      if (!(await currentProject.fileStorage.exists(runtimePath))) {
        // used to read bot project template from source (bundled in plugin)
        const fileStorage = new LocalDiskStorage();
        await copyDir(template.path, fileStorage, runtimePath, currentProject.fileStorage);
        res.json({
          settings: {
            path: runtimePath,
            startCommand: template.startCommand,
          },
          message: 'success',
        });
      } else {
        res.status(500).json({
          message: 'A runtime folder already exists in this project.',
        });
      }
    } else {
      res.status(404).json({ message: 'template not found' });
    }
  },
};
