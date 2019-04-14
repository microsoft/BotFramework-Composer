import express, { Router } from 'express';

import { ProjectController } from '../controllers/project';
import { StorageController } from '../controllers/storage';
/*
import LauncherController from '../controllers/launcher';
*/

const router: Router = express.Router({});

// projects
router.get('/projects/opened', ProjectController.getProject);
/*
router.get('/projects/opened/files', ProjectController.getFiles);
router.post('/projects/opened/files', ProjectController.createFile);
router.put('/projects/opened/files', ProjectController.updateFile); 
*/

// storages
router.get('/storages', StorageController.getStorageConnections);
router.post('/storages', StorageController.createStorageConnection);
router.get('/storages/:storageId/blobs/:path(*)', StorageController.getBlob);

/*
// launchers
router.get('/launchers/start', LauncherController.start);
router.get('/launchers/stop', LauncherController.stop);
router.get('/launchers/status', LauncherController.status);
*/

export const apiRouter = router;
