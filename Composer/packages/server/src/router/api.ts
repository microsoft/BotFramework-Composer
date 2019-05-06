import express, { Router } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { BotConnectorController } from '../controllers/connector';

const router: Router = express.Router({});

// projects
router.get('/projects/opened', ProjectController.getProject);
router.put('/projects/opened', ProjectController.openProject);
router.put('/projects/opened/dialogs/:dialogId', ProjectController.updateDialog);
router.post('/projects/opened/dialogs', ProjectController.createDialogFromTemplate);
router.put('/projects/opened/lgFiles/:lgFileId', ProjectController.updateLgFile);
router.post('/projects/opened/lgFiles', ProjectController.addLgFile);
router.put('/projects/opened/botFile', ProjectController.updateBotFile);
router.post('/projects/opened/project/saveAs', ProjectController.saveProjectAs);

// storages
router.get('/storages', StorageController.getStorageConnections);
router.post('/storages', StorageController.createStorageConnection);
router.get('/storages/:storageId/blobs/:path(*)', StorageController.getBlob);

// connector
router.get('/launcher/start', BotConnectorController.start);
router.get('/launcher/stop', BotConnectorController.stop);
router.get('/launcher/status', BotConnectorController.status);

export const apiRouter = router;
