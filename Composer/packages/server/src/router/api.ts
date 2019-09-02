import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { BotConnectorController } from '../controllers/connector';
import { AssetController } from '../controllers/asset';

const router: Router = express.Router({});

router.post('/projects', ProjectController.createProject);
router.get('/projects', ProjectController.getAllProjects);
router.get('/projects/opened', ProjectController.getProject);
router.put('/projects/opened', ProjectController.openProject);
router.put('/projects/opened/dialogs/:dialogId', ProjectController.updateDialog);
router.delete('/projects/opened/dialogs/:dialogId', ProjectController.removeDialog);
router.post('/projects/opened/dialogs', ProjectController.createDialog);
router.put('/projects/opened/lgFiles/:lgFileId', ProjectController.updateLgFile);
router.delete('/projects/opened/lgFiles/:lgFileId', ProjectController.removeLgFile);
router.post('/projects/opened/lgFiles', ProjectController.createLgFile);
router.put('/projects/opened/luFiles/:luFileId', ProjectController.updateLuFile);
router.delete('/projects/opened/luFiles/:luFileId', ProjectController.removeLuFile);
router.post('/projects/opened/luFiles/config', ProjectController.setLuisConfig);
router.post('/projects/opened/luFiles', ProjectController.createLuFile);
router.post('/projects/opened/luFiles/publish', ProjectController.publishLuis);
router.post('/projects/opened/project/saveAs', ProjectController.saveProjectAs);
router.get('/projects/recent', ProjectController.getRecentProjects);

// storages
router.get('/storages', StorageController.getStorageConnections);
router.post('/storages', StorageController.createStorageConnection);
router.get('/storages/:storageId/blobs/:path(*)', StorageController.getBlob);

// connector
router.get('/launcher/connect', BotConnectorController.connect);
router.post('/launcher/sync', BotConnectorController.sync);
router.get('/launcher/status', BotConnectorController.status);

//assets
router.get('/assets/projectTemplates', AssetController.getProjTemplates);

const ErrorHandler = (handler: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

router.stack.map(layer => {
  const fn: RequestHandler = layer.route.stack[0].handle;
  layer.route.stack[0].handle = ErrorHandler(fn);
});

export const apiRouter = router;
