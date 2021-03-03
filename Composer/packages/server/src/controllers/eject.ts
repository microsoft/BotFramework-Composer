// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExtensionContext } from '../models/extension/extensionContext';
import { BotProjectService } from '../services/project';
import { LocalDiskStorage } from '../models/storage/localDiskStorage';

export const EjectController = {
  getTemplates: async (req, res) => {
    res.json(ExtensionContext.extensions.runtimeTemplates.filter((t) => (t.eject ? true : false)));
  },
  eject: async (req, res) => {
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    const template = ExtensionContext.extensions.runtimeTemplates.find((i) => i.key === req.params.template);
    if (template?.eject) {
      let runtimePath;
      try {
        runtimePath = await template.eject(currentProject, new LocalDiskStorage(), req.body?.isReplace);
        // init bot project, make sure it include customize schema files
        await currentProject.init();
      } catch (err) {
        res.status(500).json({
          message: err.message,
        });
        return;
      }

      res.json({
        settings: {
          key: template.key,
          name: template.name,
          path: runtimePath,
          startCommand: template.startCommand,
        },
        message: 'success',
      });
    } else {
      res.status(404).json({ message: 'template not found' });
    }
  },
};
