// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { Archiver } from 'archiver';
import { remove } from 'fs-extra';
import set from 'lodash/set';

import { ExtensionContext } from '../models/extension/extensionContext';
import log from '../logger';
import { BotProjectService } from '../services/project';
import AssetService from '../services/asset';
import { LocationRef } from '../models/bot/interface';
import { getSkillManifest } from '../models/bot/skillManager';
import { getFeedUrl } from '../models/bot/feedManager';
import StorageService from '../services/storage';
import settings from '../settings';
import { BackgroundProcessManager } from '../services/backgroundProcessManager';

import { Path } from './../utility/path';

async function getProjectById(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
  try {
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    if (currentProject !== undefined && (await currentProject.exists())) {
      const project = currentProject.getProject();
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

async function getProjectByAlias(req: Request, res: Response) {
  const alias = req.params.alias;
  if (!alias) {
    res.status(400).json({
      message: 'Parameters not provided, requires "alias" parameter',
    });
    return;
  }

  const user = await ExtensionContext.getUserFromRequest(req);
  try {
    const currentProject = await BotProjectService.getProjectByAlias(alias, user);

    if (currentProject !== undefined && (await currentProject.exists())) {
      res.status(200).json({ location: currentProject.dir, id: currentProject.id, name: currentProject.name });
    } else {
      res.status(404).json({
        message: `No matching bot project found for alias ${alias}`,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function setProjectAlias(req: Request, res: Response) {
  const { alias } = req.body;
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
  if (!alias) {
    res.status(400).json({
      message: 'Parameters not provided, requires "alias" parameter',
    });
    return;
  }

  try {
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    if (currentProject !== undefined) {
      try {
        await BotProjectService.setProjectAlias(projectId, alias);
        res.status(200).json({ id: currentProject.id, name: currentProject.name, alias: alias });
      } catch (error) {
        res.status(400).json({
          message: error instanceof Error ? error.message : error,
        });
      }
    } else {
      res.status(404).json({
        message: `No matching bot project found for projectId ${projectId}`,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function removeProject(req: Request, res: Response) {
  const projectId = req.params.projectId;
  if (!projectId) {
    res.status(400).json({
      message: 'parameters not provided, require project id',
    });
    return;
  }
  try {
    const currentProject = await BotProjectService.getProjectById(projectId);
    if (currentProject !== undefined) {
      await currentProject.deleteAllFiles();
      res.status(200).json({ message: 'success' });
    } else {
      res.status(404).json({ error: 'No bot project opened' });
    }
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
}

async function openProject(req: Request, res: Response) {
  if (!req.body.storageId || !req.body.path) {
    res.status(400).json({
      message: 'parameters not provided, require storage id and path',
    });
    return;
  }
  const user = await ExtensionContext.getUserFromRequest(req);
  const path = process.platform === 'win32' ? req.body.path.replace(/^\//, '') : req.body.path;

  const location: LocationRef = {
    storageId: req.body.storageId,
    path,
  };

  try {
    const id = await BotProjectService.openProject(location, user, req.body.isRootBot);
    const currentProject = await BotProjectService.getProjectById(id, user);
    if (currentProject !== undefined) {
      await currentProject.init();
      const project = currentProject.getProject();
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
      message: 'parameters not provided, require storage id and path',
    });
    return;
  }

  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
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
      const settings = await currentProject.settingManager.get(false);
      set(settings, 'luis.name', name);
      await currentProject.updateFile('appsettings.json', JSON.stringify(settings));
      await currentProject.init();
      const project = currentProject.getProject();
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
  const user = await ExtensionContext.getUserFromRequest(req);

  const projects = await BotProjectService.getRecentBotProjects(user);
  return res.status(200).json(projects);
}

async function getFeed(req: Request, res: Response) {
  try {
    const content = await getFeedUrl();
    res.status(200).json(content);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
}
async function generateProjectId(req: Request, res: Response) {
  try {
    const location = req.query.location;
    const projectId = await BotProjectService.generateProjectId(location);
    res.status(200).json(projectId);
  } catch (ex) {
    res.status(404).json({
      message: 'Cannot generate project id',
    });
  }
}

async function updateFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const lastModified = await currentProject.updateFile(req.body.name, req.body.content);
    res.status(200).json({ lastModified: lastModified });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function createFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const { name, content } = req.body;

    //dir = id
    const file = await currentProject.createFile(name, content);
    res.status(200).json(file);
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function removeFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const dialogResources = await currentProject.deleteFile(req.params.name);
    res.status(200).json(dialogResources);
  } else {
    res.status(404).json({ error: 'No bot project opened' });
  }
}

async function updateManifestFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const lastModified = await currentProject.updateManifestLuFile(req.body.name, req.body.content);
    res.status(200).json({ lastModified: lastModified });
  } else {
    res.status(404).json({
      message: 'No such bot project found',
    });
  }
}

async function createManifestFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const { name, content } = req.body;

    //dir = id
    const file = await currentProject.createManifestLuFile(name, content);
    res.status(200).json(file);
  } else {
    res.status(404).json({
      message: 'No such bot project found',
    });
  }
}

async function removeManifestFile(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const dialogResources = await currentProject.deleteManifestLuFile(req.params.name);
    res.status(200).json(dialogResources);
  } else {
    res.status(404).json({ error: 'No bot project found' });
  }
}

async function getSkill(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
  const ignoreProjectValidation: boolean = req.query.ignoreProjectValidation;
  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (!ignoreProjectValidation) {
    if (currentProject === undefined) {
      res.status(404).json({
        message: 'No such bot project found',
      });
    }
  }
  try {
    const rootDir = currentProject.dir;
    const content = await getSkillManifest(req.query.url, rootDir);
    res.status(200).json(content);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
  }
}

async function createSkillFiles(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const { url, skillName, zipContent } = req.body;
    const file = await currentProject.createSkillFiles(url, skillName, zipContent);
    res.status(200).json(file);
  } else {
    res.status(404).json({
      message: 'No such bot project found',
    });
  }
}

async function removeSkillFiles(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const isDelete = await currentProject.deleteSkillFiles(req.params.name);
    res.status(200).json(isDelete);
  } else {
    res.status(404).json({ error: 'No bot project found' });
  }
}

async function exportProject(req: Request, res: Response) {
  const currentProject = await BotProjectService.getProjectById(req.params.projectId);
  currentProject.exportToZip(null, (archive: Archiver) => {
    archive.on('error', (err) => {
      res.status(500).send({ error: err.message });
    });

    res.attachment('tmp-archive.zip');

    archive.pipe(res);
  });
}

async function setQnASettings(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const qnaEndpointKey = await currentProject.updateQnaEndpointKey(req.body.subscriptionKey);
      res.status(200).json(qnaEndpointKey);
    } catch (error) {
      // QNA maker will occasionally fail to do this
      // instead of failing, we need to tell composer to retry
      if (
        error.message ===
          'Access denied due to invalid subscription key or wrong API endpoint. Make sure to provide a valid key for an active subscription and use a correct regional API endpoint for your resource.' ||
        error.message ===
          'No Endpoint keys found. If this is a new service, please wait a minimum of 10 minutes for the runtime to be ready.'
      ) {
        res.status(202).json({
          message: 'Waiting for QnA Maker',
        });
      } else {
        res.status(400).json({
          message: error instanceof Error ? error.message : error,
        });
      }
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function build(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  // Disable Express' built in 2 minute timeout for requests. Otherwise, large models may fail to build.
  (req as any).setTimeout(0, () => {
    throw new Error('LUIS publish process timed out.');
  });

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const { luisConfig, qnaConfig, orchestratorConfig, luFiles, qnaFiles } = req.body;
      const files = await currentProject.buildFiles({
        luisConfig,
        qnaConfig,
        orchestratorConfig,
        luResource: luFiles,
        qnaResource: qnaFiles,
      });
      res.status(200).json(files);
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
  const user = await ExtensionContext.getUserFromRequest(req);

  try {
    res.status(200).json(await StorageService.getBlob(storageId, folderPath, user));
  } catch (e) {
    res.status(400).json({
      message: e.message,
    });
  }
}

async function checkBoilerplateVersion(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const latestVersion = await AssetService.manager.getBoilerplateCurrentVersion();
    const currentVersion = await AssetService.manager.getBoilerplateVersionFromProject(currentProject);
    const updateRequired = latestVersion && currentVersion && latestVersion > currentVersion; // versions are present in both locations, latest is newer
    res.status(200).json({
      currentVersion,
      latestVersion,
      updateRequired,
    });
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function updateBoilerplate(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);

  if (currentProject !== undefined) {
    try {
      // inject shared content into every new project.  this comes from assets/shared
      await AssetService.manager.copyBoilerplate(currentProject.dataDir, currentProject.fileStorage);
      res.status(200).json({});
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
}

async function backupProject(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const project = await BotProjectService.getProjectById(projectId, user);
  if (project !== undefined) {
    try {
      const backupPath = await BotProjectService.backupProject(project);
      res.status(200).json({ path: backupPath });
    } catch (e) {
      log('Failed to backup project %s: %O', projectId, e);
      res.status(500).json(e);
    }
  } else {
    res.status(404).json({
      message: `Could not find bot project with ID: ${projectId}`,
    });
  }
}

/** WARNING: This operation is destructive. Please call backupProject() before calling this method. */
async function copyTemplateToExistingProject(req: Request, res: Response) {
  const { eTag, templateDir } = req.body;
  if (!templateDir) {
    return res.status(400).json({
      message: 'Missing parameters: templateDir required.',
    });
  }

  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const project = await BotProjectService.getProjectById(projectId, user);
  if (project !== undefined) {
    try {
      log('Cleaning up bot content at %s before copying template content over.', project.dir);
      await project.fileStorage.rmrfDir(project.dir);
      const locationRef: LocationRef = {
        storageId: 'default',
        path: project.dir,
      };
      log('Copying content from template at %s to %s', templateDir, project.dir);
      await AssetService.manager.copyRemoteProjectTemplateTo(
        templateDir,
        locationRef,
        user,
        undefined, // TODO: re-enable once we figure out path issue project.settings?.defaultLanguage || 'en-us'
      );
      log('Copied template content successfully.');
      // clean up the temporary template directory -- fire and forget
      remove(templateDir);
      log('Updating etag.');
      BotProjectService.setProjectLocationData(projectId, { eTag });

      res.sendStatus(200);
    } catch (e) {
      log('Failed to copy template content to existing project %s: %O', projectId, e);
      res.status(500).json(e);
    }
  } else {
    res.status(404).json({
      message: `Could not find bot project with ID: ${projectId}`,
    });
  }
}

function createProject(req: Request, res: Response) {
  const jobId = BackgroundProcessManager.startProcess(202, 'create', 'Creating Bot Project');
  BotProjectService.createProjectAsync(req, jobId);
  res.status(202).json({
    jobId: jobId,
  });
}

function migrateProject(req: Request, res: Response) {
  const jobId = BackgroundProcessManager.startProcess(202, 'create', 'Migrating Bot Project');
  BotProjectService.migrateProjectAsync(req, jobId);
  res.status(202).json({
    jobId: jobId,
  });
}

async function getVariablesByProjectId(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
  const project = await BotProjectService.getProjectById(projectId, user);

  if (project !== undefined) {
    try {
      const variables = await BotProjectService.staticMemoryResolver(projectId);
      res.status(200).json({ variables });
    } catch (e) {
      log('Failed to fetch memory variables for project %s: %O', projectId, e);
      res.status(500).json(e);
    }
  } else {
    res.status(404).json({
      message: `Could not find bot project with ID: ${projectId}`,
    });
  }
}

export const ProjectController = {
  getProjectById,
  openProject,
  removeProject,
  updateFile,
  createFile,
  removeFile,
  createManifestFile,
  updateManifestFile,
  removeManifestFile,
  createSkillFiles,
  removeSkillFiles,
  getSkill,
  build,
  setQnASettings,
  exportProject,
  saveProjectAs,
  createProject,
  migrateProject,
  getAllProjects,
  getRecentProjects,
  getFeed,
  updateBoilerplate,
  checkBoilerplateVersion,
  generateProjectId,
  getProjectByAlias,
  setProjectAlias,
  backupProject,
  copyTemplateToExistingProject,
  getVariablesByProjectId,
};
