// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';

import { Request, Response } from 'express';

import log from '../logger';
import { BotProjectService } from '../services/project';
import AssectService from '../services/asset';
import { LocationRef } from '../models/bot/interface';
import StorageService from '../services/storage';
import settings from '../settings';
import { PluginLoader } from '../services/pluginLoader';

import { Path } from './../utility/path';

async function createProject(req: Request, res: Response) {
  let { templateId } = req.body;
  const { name, description, storageId, location } = req.body;
  const user = await PluginLoader.getUserFromRequest(req);
  if (templateId === '') {
    templateId = 'EmptyBot';
  }

  // default the path to the default folder.
  let path = settings.botsFolder;
  // however, if path is specified as part of post body, use that one.
  // this allows developer to specify a custom home for their bot.
  if (location) {
    // validate that this path exists
    // prettier-ignore
    if (fs.existsSync(location)) { // lgtm [js/path-injection]
      path = location;
    }
  }

  const locationRef: LocationRef = {
    storageId,
    path: Path.resolve(path, name),
  };

  log('Attempting to create project at %s', path);

  try {
    const newProjRef = await AssectService.manager.copyProjectTemplateTo(templateId, locationRef, user);
    const id = await BotProjectService.openProject(newProjRef, user);
    const currentProject = await BotProjectService.getProjectById(id, user);
    if (currentProject !== undefined) {
      await currentProject.updateBotInfo(name, description);
      await currentProject.index();
      const project = currentProject.getIndexes();
      log('Project created successfully.');
      res.status(200).json({
        id,
        ...project,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: err instanceof Error ? err.message : err,
    });
  }
}

async function getProject(req: Request, res: Response) {
  throw new Error('Deprecated!');

  // const currentProject = BotProjectService.getCurrentBotProject();
  // if (currentProject !== undefined && (await currentProject.exists())) {
  //   await currentProject.index();
  //   const project = currentProject.getIndexes();
  //   res.status(200).json({
  //     ...project,
  //   });
  // } else {
  //   res.status(404).json({
  //     message: 'No such bot project opened',
  //   });
  // }
}

async function getProjectById(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  try {
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    if (currentProject !== undefined && (await currentProject.exists())) {
      await currentProject.index();
      const project = currentProject.getIndexes();
      res.status(200).json({
        id: projectId,
        ...project,
      });
    } else {
      res.status(404).json({
        message: 'No such bot project opened',
      });
    }
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
}

async function openProject(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.path) {
    res.status(400).json({
      message: 'parameters not provided, require stoarge id and path',
    });
    return;
  }

  const user = await PluginLoader.getUserFromRequest(req);

  const location: LocationRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  try {
    const id = await BotProjectService.openProject(location, user);
    const currentProject = await BotProjectService.getProjectById(id, user);
    if (currentProject !== undefined) {
      const project = currentProject.getIndexes();
      res.status(200).json({
        id: currentProject.id,
        ...project,
      });
    } else {
      res.status(404).json({
        message: 'Cannot open bot project',
      });
    }
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
}

async function saveProjectAs(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.name) {
    res.status(400).json({
      message: 'parameters not provided, require stoarge id and path',
    });
    return;
  }

  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  const originalProject = await BotProjectService.getProjectById(projectId, user);

  const { name, description, location, storageId } = req.body;

  const locationRef: LocationRef = {
    storageId,
    path: location ? Path.join(location, name) : Path.resolve(settings.botsFolder, name),
  };

  try {
    const id = await BotProjectService.saveProjectAs(originalProject, locationRef, user);
    const currentProject = await BotProjectService.getProjectById(id, user);
    if (currentProject !== undefined) {
      await currentProject.updateBotInfo(name, description);
      await currentProject.index();
      const project = currentProject.getIndexes();
      res.status(200).json({
        id,
        ...project,
      });
    } else {
      res.status(404).json({
        message: 'No such bot project opened',
      });
    }
  } catch (e) {
    res.status(400).json({
      message: e instanceof Error ? e.message : e,
    });
  }
}

async function getRecentProjects(req: Request, res: Response) {
  const user = await PluginLoader.getUserFromRequest(req);

  const projects = await BotProjectService.getRecentBotProjects(user);
  return res.status(200).json(projects);
}

async function updateDialog(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const lastModified = await currentProject.updateDialog(req.body.id, req.body.content);
    res.status(200).json({ lastModified: lastModified });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createDialog(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const content = JSON.stringify(req.body.content, null, 2) + '\n';
    const id = req.body.id;

    //dir = id
    const dialogResources = await currentProject.createDialog(id, content);
    res.status(200).json(dialogResources);
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeDialog(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const dialogResources = await currentProject.removeDialog(req.params.dialogId);
    res.status(200).json(dialogResources);
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateLgFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const lastModified = await currentProject.updateLgFile(req.body.id, req.body.content);
    res.status(200).json({ lastModified: lastModified });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createLgFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const lgFiles = await currentProject.createLgFile(req.body.id, req.body.content);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeLgFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const lgFiles = await currentProject.removeLgFile(req.params.lgFileId);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function updateLuFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const lastModified = await currentProject.updateLuFile(req.body.id, req.body.content);
      res.status(200).json({ lastModified: lastModified });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createLuFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const luFiles = await currentProject.createLuFile(req.body.id, req.body.content);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function getDefaultSlotEnvSettings(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const settings = await currentProject.getDefaultSlotEnvSettings(req.query.obfuscate);
      res.send(settings);
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function getEnvSettings(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const settings = await currentProject.getEnvSettings(req.params.slot, req.query.obfuscate);
      res.send(settings);
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function updateEnvSettings(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      await currentProject.updateEnvSettings(req.params.slot, req.body.settings);
      res.send('ok');
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function updateDefaultSlotEnvSettings(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      await currentProject.updateDefaultSlotEnvSettings(req.body.settings);
      res.send('ok');
    } catch (err) {
      res.status(404).json({
        message: err.message,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeLuFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const luFiles = await currentProject.removeLuFile(req.params.luFileId);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function publishLuis(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const luFiles = await currentProject.publishLuis(req.body.authoringKey);
      res.status(200).json({ luFiles });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : error,
      });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function getAllProjects(req: Request, res: Response) {
  const storageId = 'default';
  const folderPath = Path.resolve(settings.botsFolder);
  const user = await PluginLoader.getUserFromRequest(req);

  try {
    res.status(200).json(await StorageService.getBlob(storageId, folderPath, user));
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
}

export const ProjectController = {
  getProject,
  getProjectById,
  openProject,
  updateDialog,
  createDialog,
  removeDialog,
  updateLgFile,
  createLgFile,
  removeLgFile,
  getEnvSettings,
  getDefaultSlotEnvSettings,
  updateEnvSettings,
  updateDefaultSlotEnvSettings,
  updateLuFile,
  createLuFile,
  removeLuFile,
  publishLuis,
  saveProjectAs,
  createProject,
  getAllProjects,
  getRecentProjects,
};
