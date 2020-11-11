// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from 'fs';

import { Request, Response } from 'express';
import { Archiver } from 'archiver';
import { ExtensionContext } from '@bfc/extension';
import { SchemaMerger } from '@microsoft/bf-dialog/lib/library/schemaMerger';
import { remove } from 'fs-extra';

import log from '../logger';
import { BotProjectService } from '../services/project';
import AssetService from '../services/asset';
import { LocationRef } from '../models/bot/interface';
import { getSkillManifest } from '../models/bot/skillManager';
import StorageService from '../services/storage';
import settings from '../settings';

import { Path } from './../utility/path';

async function createProject(req: Request, res: Response) {
  let { templateId } = req.body;
  const {
    name,
    description,
    storageId,
    location,
    schemaUrl,
    locale,
    preserveRoot,
    templateDir,
    eTag,
    alias,
  } = req.body;
  const user = await ExtensionContext.getUserFromRequest(req);
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
    // the template was downloaded remotely (via import) and will be used instead of an internal Composer template
    const createFromRemoteTemplate = !!templateDir;

    await BotProjectService.cleanProject(locationRef);
    let newProjRef;
    if (createFromRemoteTemplate) {
      log('Creating project from remote template at %s', templateDir);
      newProjRef = await AssetService.manager.copyRemoteProjectTemplateTo(templateDir, locationRef, user, locale);
      // clean up the temporary template directory -- fire and forget
      remove(templateDir);
    } else {
      log('Creating project from internal template %s', templateId);
      newProjRef = await AssetService.manager.copyProjectTemplateTo(templateId, locationRef, user, locale);
    }
    const id = await BotProjectService.openProject(newProjRef, user);
    // in the case of a remote template, we need to update the eTag and alias used by the import mechanism
    createFromRemoteTemplate && BotProjectService.setProjectLocationData(id, { alias, eTag });
    const currentProject = await BotProjectService.getProjectById(id, user);

    // inject shared content into every new project.  this comes from assets/shared
    if (!createFromRemoteTemplate) {
      await AssetService.manager.copyBoilerplate(currentProject.dataDir, currentProject.fileStorage);
    }

    if (currentProject !== undefined) {
      if (currentProject.settings?.runtime?.customRuntime === true) {
        const runtime = ExtensionContext.getRuntimeByProject(currentProject);
        const runtimePath = currentProject.settings.runtime.path;

        if (!fs.existsSync(runtimePath)) {
          await runtime.eject(currentProject, currentProject.fileStorage);
        }

        // install all dependencies and build the app
        await runtime.build(runtimePath, currentProject);

        const manifestFile = runtime.identifyManifest(runtimePath);

        // run the merge command to merge all package dependencies from the template to the bot project
        const realMerge = new SchemaMerger(
          [manifestFile],
          Path.join(currentProject.dataDir, 'schemas/sdk'),
          Path.join(currentProject.dataDir, 'dialogs/imported'),
          false,
          false,
          console.log,
          console.warn,
          console.error
        );

        await realMerge.merge();
      }
      await currentProject.updateBotInfo(name, description, preserveRoot);
      if (schemaUrl && !createFromRemoteTemplate) {
        await currentProject.saveSchemaToProject(schemaUrl, locationRef.path);
      }
      await currentProject.init();

      const project = currentProject.getProject();
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
      message: 'parameters not provided, requires alias parameter',
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
        message: 'No matching ',
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
      message: 'parameters not provided, require stoarge id and path',
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
    const id = await BotProjectService.openProject(location, user);
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
      message: 'parameters not provided, require stoarge id and path',
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

async function getSkill(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);
  const ignoreProjectValidation: boolean = req.query.ignoreProjectValidation;
  if (!ignoreProjectValidation) {
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    if (currentProject === undefined) {
      res.status(404).json({
        message: 'No such bot project opened',
      });
    }
  }
  try {
    const content = await getSkillManifest(req.query.url);
    res.status(200).json(content);
  } catch (err) {
    res.status(404).json({
      message: err.message,
    });
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

async function build(req: Request, res: Response) {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const { luisConfig, qnaConfig, luFiles, qnaFiles } = req.body;
      const files = await currentProject.buildFiles({
        luisConfig,
        qnaConfig,
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
    const updateRequired =
      (latestVersion && currentVersion && latestVersion > currentVersion) || // versions are present in both locations, latest is newer
      (latestVersion && !currentVersion); // latest version exists, but is mssing from project

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
        undefined // TODO: re-enable once we figure out path issue project.settings?.defaultLanguage || 'en-us'
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

export const ProjectController = {
  getProjectById,
  openProject,
  removeProject,
  updateFile,
  createFile,
  removeFile,
  getSkill,
  build,
  setQnASettings,
  exportProject,
  saveProjectAs,
  createProject,
  getAllProjects,
  getRecentProjects,
  updateBoilerplate,
  checkBoilerplateVersion,
  generateProjectId,
  getProjectByAlias,
  backupProject,
  copyTemplateToExistingProject,
};
