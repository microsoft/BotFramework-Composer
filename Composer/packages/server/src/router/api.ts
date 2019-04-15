import express, { Router } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
import { BotConnectorController } from '../controllers/connector';

const router: Router = express.Router({});

// projects
router.get('/projects/opened', ProjectController.getProject);
router.put('/projects/opened', ProjectController.openProject);
router.put('/projects/opened/files', ProjectController.updateFile);
router.post('/projects/opened/files', ProjectController.createFileFromTemplate);

// storages
router.get('/storages', StorageController.getStorageConnections);
router.post('/storages', StorageController.createStorageConnection);
router.get('/storages/:storageId/blobs/:path(*)', StorageController.getBlob);

// connector
router.get('/launchers/start', BotConnectorController.start);
router.get('/launchers/stop', BotConnectorController.stop);
router.get('/launchers/status', BotConnectorController.status);

export const apiRouter = router;
