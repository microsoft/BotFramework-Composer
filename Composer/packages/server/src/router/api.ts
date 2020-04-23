// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { PublishController } from '../controllers/publisher';
import { AssetController } from '../controllers/asset';
import { EjectController } from '../controllers/eject';

const router: Router = express.Router({});

router.post('/projects', ProjectController.createProject);
router.get('/projects', ProjectController.getAllProjects);
router.get('/projects/recent', ProjectController.getRecentProjects);

router.get('/projects/:projectId', ProjectController.getProjectById);
router.put('/projects/open', ProjectController.openProject);
router.put('/projects/:projectId/files/:name', ProjectController.updateFile);
router.delete('/projects/:projectId/files/:name', ProjectController.removeFile);
router.post('/projects/:projectId/files', ProjectController.createFile);
router.get('/projects/:projectId/settings', ProjectController.getDefaultSlotEnvSettings); // ?obfuscate=<boolean>
router.post('/projects/:projectId/settings', ProjectController.updateDefaultSlotEnvSettings);
router.get('/projects/:projectId/settings/:slot', ProjectController.getEnvSettings); // ?obfuscate=<boolean>
router.post('/projects/:projectId/settings/:slot', ProjectController.updateEnvSettings);
router.post('/projects/:projectId/skills', ProjectController.updateSkill);
router.post('/projects/:projectId/luFiles/publish', ProjectController.publishLuis);
router.post('/projects/:projectId/project/saveAs', ProjectController.saveProjectAs);
router.get('/projects/:projectId/export', ProjectController.exportProject);

// storages
router.put('/storages/currentPath', StorageController.updateCurrentPath);
router.get('/storages', StorageController.getStorageConnections);
router.post('/storages', StorageController.createStorageConnection);
router.get('/storages/:storageId/blobs', StorageController.getBlob);

// publishing
router.get('/publish/types', PublishController.getTypes);
router.get('/publish/:projectId/status/:target', PublishController.status);
router.post('/publish/:projectId/publish/:target', PublishController.publish);
router.get('/publish/:projectId/history/:target', PublishController.history);
router.post('/publish/:projectId/rollback/:target', PublishController.rollback);

router.get('/publish/:method', PublishController.publish);

// runtime ejection
router.get('/runtime/templates', EjectController.getTemplates);
router.post('/runtime/eject/:projectId/:template', EjectController.eject);

//assets
router.get('/assets/projectTemplates', AssetController.getProjTemplates);

const ErrorHandler = (handler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.stack.map(layer => {
  const fn: RequestHandler = layer.route.stack[0].handle;
  layer.route.stack[0].handle = ErrorHandler(fn);
});

export const apiRouter = router;
