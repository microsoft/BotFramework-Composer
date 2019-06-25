import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { BotConnectorController } from '../controllers/connector';
import { AssetController } from '../controllers/asset';

const ErrorHandler = (handler: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const router: Router = express.Router({});

// projects
router.post('/projects', ErrorHandler(ProjectController.createProject));
router.get('/projects/opened', ErrorHandler(ProjectController.getProject));
router.put('/projects/opened', ErrorHandler(ProjectController.openProject));
router.put('/projects/opened/dialogs/:dialogId', ErrorHandler(ProjectController.updateDialog));
router.post('/projects/opened/dialogs', ErrorHandler(ProjectController.createDialog));
router.put('/projects/opened/lgFiles/:lgFileId', ErrorHandler(ProjectController.updateLgFile));
router.delete('/projects/opened/lgFiles/:lgFileId', ProjectController.removeLgFile);
router.post('/projects/opened/lgFiles', ErrorHandler(ProjectController.createLgFile));
router.put('/projects/opened/luFiles/:luFileId', ErrorHandler(ProjectController.updateLuFile));
router.delete('/projects/opened/luFiles/:luFileId', ErrorHandler(ProjectController.removeLuFile));
router.post('/projects/opened/luFiles', ErrorHandler(ProjectController.createLuFile));
router.post('/projects/opened/luFiles/publish', ErrorHandler(ProjectController.publishLuis));
router.put('/projects/opened/botFile', ErrorHandler(ProjectController.updateBotFile));
router.post('/projects/opened/project/saveAs', ErrorHandler(ProjectController.saveProjectAs));

// storages
router.get('/storages', ErrorHandler(StorageController.getStorageConnections));
router.post('/storages', ErrorHandler(StorageController.createStorageConnection));
router.get('/storages/:storageId/blobs/:path(*)', ErrorHandler(StorageController.getBlob));
router.get('/storages/fixed', ErrorHandler(StorageController.getAllBots));
// connector
router.get('/launcher/connect', ErrorHandler(BotConnectorController.connect));
router.post('/launcher/sync', ErrorHandler(BotConnectorController.sync));
router.get('/launcher/status', ErrorHandler(BotConnectorController.status));

//assets
router.get('/assets/projectTemplates', ErrorHandler(AssetController.getProjTemplates));

export const apiRouter = router;
