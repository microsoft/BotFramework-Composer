import { Request, Response } from 'express';

import ProjectService from '../services/project';
import AssectService from '../services/asset';
import { LocationRef } from '../models/bot/interface';

async function createProject(req: Request, res: Response) {
  const locationRef: LocationRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };
  try {
    await AssectService.manager.copyProjectTemplateTo(req.body.templateId, locationRef);
    await ProjectService.openProject(locationRef);
    if (ProjectService.currentBotProject !== undefined) {
      const project = await ProjectService.currentBotProject.getIndexes();
      res.status(200).json({ ...project });
    }
  } catch (err) {
    res.status(404).json({ error: 'Create bot project error' });
  }
}

async function getProject(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined && (await ProjectService.currentBotProject.exists())) {
    await ProjectService.currentBotProject.index();
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

  const locationRef: LocationRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  if (!locationRef.path.endsWith('.botproj')) {
    res.status(400).json('unsupported project file type, expect .botproj');
    return;
  }

  try {
    await ProjectService.openProject(locationRef);
    if (ProjectService.currentBotProject !== undefined) {
      const project = await ProjectService.currentBotProject.getIndexes();
      res.status(200).json({ ...project });
    } else {
      res.status(404).json({ error: 'No bot project opened' });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
}

async function saveProjectAs(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.path) {
    res.status(400).json('parameters not provided, require stoarge id and path');
    return;
  }

  const locationRef: LocationRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  if (!locationRef.path.endsWith('.botproj')) {
    res.status(400).json('unsupported project file type, expect .botproj');
    return;
  }

  try {
    await ProjectService.saveProjectAs(locationRef);
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
    const dialogs = await ProjectService.currentBotProject.createDialogFromTemplate(req.body.name);
    res.status(200).json({ dialogs });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateLgFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const lgFiles = await ProjectService.currentBotProject.updateLgFile(req.body.id, req.body.content);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function createLgFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const lgFiles = await ProjectService.currentBotProject.createLgFile(req.body.id);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function removeLgFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const lgFiles = await ProjectService.currentBotProject.removeLgFile(req.params.lgFileId);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateLuFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const luFiles = await ProjectService.currentBotProject.updateLuFile(req.body.id, req.body.content);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function createLuFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const luFiles = await ProjectService.currentBotProject.createLuFile(req.body.id);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function removeLuFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const luFiles = await ProjectService.currentBotProject.removeLuFile(req.params.luFileId);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

export const ProjectController = {
  getProject: getProject,
  openProject: openProject,
  updateDialog: updateDialog,
  createDialogFromTemplate: createDialogFromTemplate,
  updateLgFile,
  createLgFile,
  removeLgFile,
  updateLuFile,
  createLuFile,
  removeLuFile,
  updateBotFile: updateBotFile,
  saveProjectAs: saveProjectAs,
  createProject: createProject,
};
