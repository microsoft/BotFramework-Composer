import { Request, Response } from 'express';

import ProjectService from '../services/project';
import { BotProjectRef } from '../models/bot/interface';

async function getProject(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const files = await ProjectService.currentBotProject.getFiles();
    res.status(200).json({ projectFiles: files });
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
    res.status(200).json('OK');
  } catch (e) {
    res.status(400).json(e);
  }
}

async function updateFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    await ProjectService.currentBotProject.updateFile(req.body.name, req.body.content);
    res.status(200).json('OK');
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function createFileFromTemplate(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    await ProjectService.currentBotProject.createFileFromTemplate(req.body.name, req.body.steps);
    res.status(200).json('OK');
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

export const ProjectController = {
  getProject: getProject,
  openProject: openProject,
  updateFile: updateFile,
  createFileFromTemplate: createFileFromTemplate,
};
