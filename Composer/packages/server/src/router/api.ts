// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { PublishController } from '../controllers/publisher';
import { AssetController } from '../controllers/asset';
import { EjectController } from '../controllers/eject';
import * as PluginsController from '../controllers/plugins';

import { UtilitiesController } from './../controllers/utilities';

const router: Router = express.Router({});

router.post('/projects', ProjectController.createProject);
router.get('/projects', ProjectController.getAllProjects);
router.get('/projects/recent', ProjectController.getRecentProjects);

router.get('/projects/:projectId', ProjectController.getProjectById);
router.put('/projects/open', ProjectController.openProject);
router.delete('/projects/:projectId', ProjectController.removeProject);
router.put('/projects/:projectId/files/:name', ProjectController.updateFile);
router.delete('/projects/:projectId/files/:name', ProjectController.removeFile);
router.post('/projects/:projectId/files', ProjectController.createFile);
router.post('/projects/:projectId/skills', ProjectController.updateSkill);
router.post('/projects/:projectId/skill/check', ProjectController.getSkill);
router.post('/projects/:projectId/build', ProjectController.build);
router.post('/projects/:projectId/qnaSettings/set', ProjectController.setQnASettings);
router.post('/projects/:projectId/project/saveAs', ProjectController.saveProjectAs);
router.get('/projects/:projectId/export', ProjectController.exportProject);

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

//help api
router.get('/utilities/qna/parse', UtilitiesController.getQnaContent);
// plugins
router.get('/plugins', PluginsController.listPlugins);
router.post('/plugins', PluginsController.addPlugin);
router.delete('/plugins', PluginsController.removePlugin);
router.patch('/plugins/toggle', PluginsController.togglePlugin);
router.get('/plugins/search', PluginsController.searchPlugins);
router.get('/plugins/:id/view/:view', PluginsController.getBundleForView);
// proxy route for plugins (allows plugin client code to make fetch calls using the Composer server as a proxy -- avoids browser blocking request due to CORS)
router.post('/plugins/proxy/:url', PluginsController.performPluginFetch);

const ErrorHandler = (handler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.stack.map((layer) => {
  const fn: RequestHandler = layer.route.stack[0].handle;
  layer.route.stack[0].handle = ErrorHandler(fn);
});

export const apiRouter = router;
