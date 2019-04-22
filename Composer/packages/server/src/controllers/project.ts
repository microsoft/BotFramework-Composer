import { Request, Response } from 'express';

import ProjectService from '../services/project';
import { BotProjectRef } from '../models/bot/interface';

async function getProject(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    ProjectService.currentBotProject.index();
    const project = await ProjectService.currentBotProject.getIndexes();
    res.status(200).json({ ...project });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function openProject(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.path) {
    res.status(400).json('parameters not provided, require stoarge id and path');
    return;
  }

  const projRef: BotProjectRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  if (!projRef.path.endsWith('.botproj')) {
    res.status(400).json('unsupported project file type, expect .botproj');
    return;
  }

  try {
    await ProjectService.openProject(projRef);
    if (ProjectService.currentBotProject !== undefined) {
      const project = await ProjectService.currentBotProject.getIndexes();
      res.status(200).json({ ...project });
    } else {
      res.status(404).json({ error: 'No bot project opened' });
    }
  } catch (e) {
    res.status(400).json(e);
  }
}

async function saveProjectAs(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.path) {
    res.status(400).json('parameters not provided, require stoarge id and path');
    return;
  }

  const projRef: BotProjectRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  if (!projRef.path.endsWith('.botproj')) {
    res.status(400).json('unsupported project file type, expect .botproj');
    return;
  }

  try {
    await ProjectService.saveProjectAs(projRef);
    if (ProjectService.currentBotProject !== undefined) {
      const project = await ProjectService.currentBotProject.getIndexes();
      res.status(200).json({ ...project });
    } else {
      res.status(404).json({ error: 'No bot project opened' });
    }
  } catch (e) {
    res.status(400).json(e);
  }
}

async function updateDialog(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const dialogs = await ProjectService.currentBotProject.updateDialog(req.body.name, req.body.content);
    res.status(200).json({ dialogs });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateBotFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const botFile = await ProjectService.currentBotProject.updateBotFile(req.body.name, req.body.content);
    res.status(200).json({ botFile });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function createDialogFromTemplate(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const dialogs = await ProjectService.currentBotProject.createDialogFromTemplate(req.body.name, req.body.steps);
    res.status(200).json({ dialogs });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateLgTemplate(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const lgTemplates = await ProjectService.currentBotProject.updateLgTemplate(req.body.name, req.body.content);
    res.status(200).json({ lgTemplates });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

export const ProjectController = {
  getProject: getProject,
  openProject: openProject,
  updateDialog: updateDialog,
  createDialogFromTemplate: createDialogFromTemplate,
  updateLgTemplate: updateLgTemplate,
  updateBotFile: updateBotFile,
  saveProjectAs: saveProjectAs,
};
