import { Request, Response } from 'express';
import { merge } from 'lodash';

import ProjectService from '../services/project';
import AssectService from '../services/asset';
import { LocationRef } from '../models/bot/interface';
import StorageService from '../services/storage';
import settings from '../settings/settings.json';
import { ProjectError } from '../models/serverError/serverError';

import DIALOG_TEMPLATE from './../store/dialogTemplate.json';
import { Path } from './../utility/path';

async function createProject(req: Request, res: Response) {
  let { templateId } = req.body;
  const { name, description, storageId } = req.body;
  if (templateId === '') {
    templateId = 'EmptyBot';
  }

  const locationRef: LocationRef = {
    storageId,
    path: Path.resolve(settings.development.defaultFolder, name),
  };

  try {
    const newProjRef = await AssectService.manager.copyProjectTemplateTo(templateId, locationRef);
    await ProjectService.openProject(newProjRef);
    if (ProjectService.currentBotProject !== undefined) {
      await ProjectService.currentBotProject.updateBotInfo(name, description);
      await ProjectService.currentBotProject.index();
      const project = ProjectService.currentBotProject.getIndexes();
      res.status(200).json({
        ...project,
      });
    }
  } catch (err) {
    res.status(404).json(
      new ProjectError({
        message: err instanceof Error ? err.message : err,
        title: 'Create Bot Project Error',
        statusCode: 404,
      })
    );
  }
}

async function getProject(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined && (await ProjectService.currentBotProject.exists())) {
    await ProjectService.currentBotProject.index();
    const project = await ProjectService.currentBotProject.getIndexes();
    res.status(200).json({
      ...project,
    });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Get Bot Project Error',
        statusCode: 404,
      })
    );
  }
}

async function openProject(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.path) {
    res.status(400).json(
      new ProjectError({
        message: 'parameters not provided, require stoarge id and path',
        title: 'Open Bot Project Error',
        statusCode: 400,
      })
    );
    return;
  }

  const location: LocationRef = {
    storageId: req.body.storageId,
    path: req.body.path,
  };

  try {
    await ProjectService.openProject(location);
    if (ProjectService.currentBotProject !== undefined) {
      const project = await ProjectService.currentBotProject.getIndexes();
      res.status(200).json({
        ...project,
      });
    } else {
      res.status(404).json(
        new ProjectError({
          message: 'No such bot project opened',
          title: 'Open Bot Project Error',
          statusCode: 404,
        })
      );
    }
  } catch (e) {
    res.status(400).json(
      new ProjectError({
        message: e.message,
        title: 'Open Bot Project Error',
        statusCode: 400,
      })
    );
  }
}

async function saveProjectAs(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.name) {
    res.status(400).json(
      new ProjectError({
        message: 'parameters not provided, require stoarge id and path',
        title: 'Open Bot Project Error',
        statusCode: 400,
      })
    );
    return;
  }

  const { name, description, storageId } = req.body;

  const locationRef: LocationRef = {
    storageId,
    path: Path.resolve(settings.development.defaultFolder, name),
  };

  try {
    await ProjectService.saveProjectAs(locationRef);
    if (ProjectService.currentBotProject !== undefined) {
      await ProjectService.currentBotProject.updateBotInfo(name, description);
      await ProjectService.currentBotProject.index();
      const project = await ProjectService.currentBotProject.getIndexes();
      res.status(200).json({
        ...project,
      });
    } else {
      res.status(404).json(
        new ProjectError({
          message: 'No such bot project opened',
          title: 'SaveAs Project Error',
          statusCode: 404,
        })
      );
    }
  } catch (e) {
    res.status(400).json(
      new ProjectError({
        message: e instanceof Error ? e.message : e,
        title: 'SaveAs Project Error',
        statusCode: 400,
      })
    );
  }
}

async function getRecentProjects(req: Request, res: Response) {
  const project = ProjectService.recentBotProjects;
  return res.status(200).json(project);
}

async function updateDialog(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const dialogs = await ProjectService.currentBotProject.updateDialog(req.body.id, req.body.content);
    res.status(200).json({ dialogs });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Update Dialog Error',
        statusCode: 404,
      })
    );
  }
}

async function createDialog(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const content = JSON.stringify(merge(req.body.content, DIALOG_TEMPLATE), null, 2) + '\n';
    //dir = id
    const dialogs = await ProjectService.currentBotProject.createDialog(req.body.id, content, req.body.id);
    const luFiles = await ProjectService.currentBotProject.createLuFile(req.body.id, '', req.body.id);
    res.status(200).json({ dialogs, luFiles });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Create Dialog Error',
        statusCode: 404,
      })
    );
  }
}

async function updateLgFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const lgFiles = await ProjectService.currentBotProject.updateLgFile(req.body.id, req.body.content);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Update Lg File Error',
        statusCode: 404,
      })
    );
  }
}

async function createLgFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const lgFiles = await ProjectService.currentBotProject.createLgFile(req.body.id, req.body.content);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Update LG File Error',
        statusCode: 404,
      })
    );
  }
}

async function removeLgFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const lgFiles = await ProjectService.currentBotProject.removeLgFile(req.params.lgFileId);
    res.status(200).json({ lgFiles });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Remove LG File Error',
        statusCode: 404,
      })
    );
  }
}

async function updateLuFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const luFiles = await ProjectService.currentBotProject.updateLuFile(req.body.id, req.body.content);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Update LU File Error',
        statusCode: 404,
      })
    );
  }
}

async function createLuFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const luFiles = await ProjectService.currentBotProject.createLuFile(req.body.id, req.body.content);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Create LU File Error',
        statusCode: 404,
      })
    );
  }
}

async function removeLuFile(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    const luFiles = await ProjectService.currentBotProject.removeLuFile(req.params.luFileId);
    res.status(200).json({ luFiles });
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Remove LU File Error',
        statusCode: 404,
      })
    );
  }
}

async function publishLuis(req: Request, res: Response) {
  if (ProjectService.currentBotProject !== undefined) {
    try {
      const status = await ProjectService.currentBotProject.publishLuis(req.body);
      res.status(200).json({ status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(404).json(
      new ProjectError({
        message: 'No such bot project opened',
        title: 'Publish LU File Error',
        statusCode: 404,
      })
    );
  }
}

async function getAllProjects(req: Request, res: Response) {
  const storageId = 'default';
  const folderPath = Path.resolve(settings.development.defaultFolder);
  try {
    res.status(200).json(await StorageService.getBlob(storageId, folderPath));
  } catch (e) {
    res.status(400).json(
      new ProjectError({
        message: e.message,
        title: 'Get All Projects Error',
        statusCode: 400,
      })
    );
  }
}

export const ProjectController = {
  getProject,
  openProject,
  updateDialog,
  createDialog,
  updateLgFile,
  createLgFile,
  removeLgFile,
  updateLuFile,
  createLuFile,
  removeLuFile,
  publishLuis,
  saveProjectAs,
  createProject,
  getAllProjects,
  getRecentProjects,
};
