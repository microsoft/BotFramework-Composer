import * as fs from 'fs';

import { Request, Response } from 'express';

import { BotProjectService } from '../services/project';
import AssectService from '../services/asset';
import { LocationRef } from '../models/bot/interface';
import StorageService from '../services/storage';
import settings from '../settings/settings.json';

import { Path } from './../utility/path';

async function createProject(req: Request, res: Response) {
  let { templateId } = req.body;
  const { name, description, storageId } = req.body;
  if (templateId === '') {
    templateId = 'EmptyBot';
  }

  // default the path to the default folder.
  let path = settings.development.defaultFolder;
  // however, if path is specified as part of post body, use that one.
  // this allows developer to specify a custom home for their bot.
  if (req.body.location) {
    // validate that this path exists
    if (fs.existsSync(req.body.location) === true) {
      path = req.body.location;
    }
  }

  const locationRef: LocationRef = {
    storageId,
    path: Path.resolve(path, name),
  };

  try {
    const newProjRef = await AssectService.manager.copyProjectTemplateTo(templateId, locationRef);
    await BotProjectService.openProject(newProjRef);
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject !== undefined) {
      await currentProject.updateBotInfo(name, description);
      await currentProject.index();
      const project = currentProject.getIndexes();
      res.status(200).json({
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
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined && (await currentProject.exists())) {
    await currentProject.index();
    const project = currentProject.getIndexes();
    res.status(200).json({
      ...project,
    });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
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

  const location: LocationRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  try {
    await BotProjectService.openProject(location);
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject !== undefined) {
      const project = currentProject.getIndexes();
      res.status(200).json({
        ...project,
      });
    } else {
      res.status(404).json({
        message: 'No such bot project opened',
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

  const { name, description, storageId } = req.body;

  const locationRef: LocationRef = {
    storageId,
    path: Path.resolve(settings.development.defaultFolder, name),
  };

  try {
    await BotProjectService.saveProjectAs(locationRef);
    const currentProject = BotProjectService.getCurrentBotProject();
    if (currentProject !== undefined) {
      await currentProject.updateBotInfo(name, description);
      await currentProject.index();
      const project = currentProject.getIndexes();
      res.status(200).json({
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

function getRecentProjects(req: Request, res: Response) {
  const projects = BotProjectService.getRecentBotProjects();
  return res.status(200).json(projects);
}

async function updateDialog(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const dialogs = await currentProject.updateDialog(req.body.id, req.body.content);
    res.status(200).json({ dialogs });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createDialog(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const content = JSON.stringify(req.body.content, null, 2) + '\n';
    //dir = id
    const dialogs = await currentProject.createDialog(req.body.id, content);
    const luFiles = await currentProject.createLuFile(req.body.id, '');
    res.status(200).json({ dialogs, luFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeDialog(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const dialogs = await currentProject.removeDialog(req.params.dialogId);
    const luFiles = await currentProject.removeLuFile(req.params.dialogId);
    res.status(200).json({ dialogs, luFiles });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateLgFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    const lgFiles = await currentProject.updateLgFile(req.body.id, req.body.content);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createLgFile(req: Request, res: Response) {
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
  if (currentProject !== undefined) {
    try {
      const luFiles = await currentProject.updateLuFile(req.body.id, req.body.content);
      res.status(200).json({ luFiles });
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const currentProject = BotProjectService.getCurrentBotProject();
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
  const folderPath = Path.resolve(settings.development.defaultFolder);
  try {
    res.status(200).json(await StorageService.getBlob(storageId, folderPath));
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
}

export const ProjectController = {
  getProject,
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
