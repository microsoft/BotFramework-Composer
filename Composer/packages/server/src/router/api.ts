// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { PublishController } from '../controllers/publisher';
import { AssetController } from '../controllers/asset';
import { EjectController } from '../controllers/eject';
import { FormDialogController } from '../controllers/formDialog';
import * as ExtensionsController from '../controllers/extensions';

import { UtilitiesController } from './../controllers/utilities';

const router: Router = express.Router({});

router.post('/projects', ProjectController.createProject);
router.get('/projects', ProjectController.getAllProjects);
router.get('/projects/recent', ProjectController.getRecentProjects);
router.get('/projects/generateProjectId', ProjectController.generateProjectId);

router.get('/projects/:projectId', ProjectController.getProjectById);
router.put('/projects/open', ProjectController.openProject);
router.delete('/projects/:projectId', ProjectController.removeProject);
router.put('/projects/:projectId/files/:name', ProjectController.updateFile);
router.delete('/projects/:projectId/files/:name', ProjectController.removeFile);
router.post('/projects/:projectId/files', ProjectController.createFile);
router.get('/projects/:projectId/skill/retrieveSkillManifest', ProjectController.getSkill);
router.post('/projects/:projectId/build', ProjectController.build);
router.post('/projects/:projectId/qnaSettings/set', ProjectController.setQnASettings);
router.post('/projects/:projectId/project/saveAs', ProjectController.saveProjectAs);
router.get('/projects/:projectId/export', ProjectController.exportProject);

// form dialog generation apis
router.post('/formDialogs/expandJsonSchemaProperty', FormDialogController.expandJsonSchemaProperty);
router.get('/formDialogs/templateSchemas', FormDialogController.getTemplateSchemas);
router.post('/formDialogs/:projectId/generate', FormDialogController.generate);

// update the boilerplate content
router.get('/projects/:projectId/boilerplateVersion', ProjectController.checkBoilerplateVersion);
router.post('/projects/:projectId/updateBoilerplate', ProjectController.updateBoilerplate);

// storages
router.put('/storages/currentPath', StorageController.updateCurrentPath);
router.get('/storages', StorageController.getStorageConnections);
router.post('/storages', StorageController.createStorageConnection);
router.get('/storages/:storageId/blobs', StorageController.getBlob);
router.post('/storages/folder', StorageController.createFolder);
router.put('/storages/folder', StorageController.updateFolder);

// publishing
router.get('/publish/types', PublishController.getTypes);
router.get('/publish/:projectId/status/:target', PublishController.status);
router.post('/publish/:projectId/publish/:target', PublishController.publish);
router.get('/publish/:projectId/history/:target', PublishController.history);
router.post('/publish/:projectId/rollback/:target', PublishController.rollback);
router.post('/publish/:projectId/stopPublish/:target', PublishController.stopBot);

router.get('/publish/:method', PublishController.publish);

// runtime ejection
router.get('/runtime/templates', EjectController.getTemplates);
router.post('/runtime/eject/:projectId/:template', EjectController.eject);

//assets
router.get('/assets/projectTemplates', AssetController.getProjTemplates);

router.use('/assets/locales/', express.static(path.join(__dirname, '..', '..', 'src', 'locales')));

//help api
router.get('/utilities/qna/parse', UtilitiesController.getQnaContent);
// extensions
router.get('/extensions', ExtensionsController.listExtensions);
router.post('/extensions', ExtensionsController.addExtension);
router.delete('/extensions', ExtensionsController.removeExtension);
router.patch('/extensions/toggle', ExtensionsController.toggleExtension);
router.get('/extensions/search', ExtensionsController.searchExtensions);
router.get('/extensions/:id/:bundleId', ExtensionsController.getBundleForView);
// proxy route for extensions (allows extension client code to make fetch calls using the Composer server as a proxy -- avoids browser blocking request due to CORS)
router.post('/extensions/proxy/:url', ExtensionsController.performExtensionFetch);

const errorHandler = (handler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.stack.forEach((layer) => {
  if (layer.route == null) return;
  const fn: RequestHandler = layer.route.stack[0].handle;
  layer.route.stack[0].handle = errorHandler(fn);
});

export const apiRouter = router;
