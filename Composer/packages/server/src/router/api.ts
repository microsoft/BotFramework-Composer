import express, { Router } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { BotConnectorController } from '../controllers/connector';
import { AssetController } from '../controllers/asset';

const router: Router = express.Router({});

// projects
router.post('/projects', ProjectController.createProject);
router.get('/projects/opened', ProjectController.getProject);
router.put('/projects/opened', ProjectController.openProject);
router.put('/projects/opened/dialogs/:dialogId', ProjectController.updateDialog);
router.post('/projects/opened/dialogs', ProjectController.createDialogFromTemplate);
router.put('/projects/opened/lgFiles/:lgFileId', ProjectController.updateLgFile);
router.delete('/projects/opened/lgFiles/:lgFileId', ProjectController.removeLgFile);
router.post('/projects/opened/lgFiles', ProjectController.createLgFile);
router.put('/projects/opened/luFiles/:luFileId', ProjectController.updateLuFile);
router.delete('/projects/opened/luFiles/:luFileId', ProjectController.removeLuFile);
router.post('/projects/opened/luFiles', ProjectController.createLuFile);
router.post('/projects/opened/luFiles/publish', ProjectController.publishLuis);
router.put('/projects/opened/botFile', ProjectController.updateBotFile);
router.post('/projects/opened/project/saveAs', ProjectController.saveProjectAs);

// storages
router.get('/storages', StorageController.getStorageConnections);
router.post('/storages', StorageController.createStorageConnection);
router.get('/storages/:storageId/blobs/:path(*)', StorageController.getBlob);

// connector
router.get('/launcher/connect', BotConnectorController.connect);
router.get('/launcher/sync', BotConnectorController.sync);
router.get('/launcher/status', BotConnectorController.status);

//assets
router.get('/assets/projectTemplates', AssetController.getProjTemplates);

export const apiRouter = router;
