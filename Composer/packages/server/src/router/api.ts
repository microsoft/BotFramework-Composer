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
import { ProvisionController } from '../controllers/provision';
import { FeatureFlagController } from '../controllers/featureFlags';
import { AuthController } from '../controllers/auth';
import { csrfProtection } from '../middleware/csrfProtection';
import { ImportController } from '../controllers/import';
import { StatusController } from '../controllers/status';
import { SettingsController } from '../controllers/settings';
import { TelemetryController } from '../controllers/telemetry';
import { OrchestratorController } from '../controllers/orchestrator';

import { UtilitiesController } from './../controllers/utilities';

const router: Router = express.Router({});

router.post('/projects', ProjectController.createProject);
router.post('/v2/projects', ProjectController.createProjectV2);
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
router.get('/projects/alias/:alias', ProjectController.getProjectByAlias);
router.post('/projects/:projectId/alias/set', ProjectController.setProjectAlias);
router.post('/projects/:projectId/backup', ProjectController.backupProject);
router.post('/projects/:projectId/copyTemplateToExisting', ProjectController.copyTemplateToExistingProject);
router.get('/projects/:projectId/variables', ProjectController.getVariablesByProjectId);

// form dialog generation apis
router.post('/formDialogs/expandJsonSchemaProperty', FormDialogController.expandJsonSchemaProperty);
router.get('/formDialogs/templateSchemas', FormDialogController.getTemplateSchemas);
router.post('/formDialogs/:projectId/generate', FormDialogController.generate);
router.delete('/formDialogs/:projectId/:dialogId', FormDialogController.deleteDialog);

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

// provision
router.get('/provision/:projectId/status/:type/:target/:jobId', ProvisionController.getProvisionStatus);
router.get('/provision/:projectId/:type/resources', ProvisionController.getResources);
router.post('/provision/:projectId/:type', ProvisionController.provision);

// publishing
router.get('/publish/types', PublishController.getTypes);
router.get('/publish/:projectId/status/:target/:jobId', PublishController.status);
router.get('/publish/:projectId/status/:target', PublishController.status);
router.post('/publish/:projectId/publish/:target', PublishController.publish);
router.get('/publish/:projectId/history/:target', PublishController.history);
router.post('/publish/:projectId/rollback/:target', PublishController.rollback);
router.post('/publish/:projectId/stopPublish/:target', PublishController.stopBot);
router.post('/publish/:projectId/pull/:target', PublishController.pull);

router.get('/publish/:method', PublishController.publish);

// runtime ejection
router.get('/runtime/templates', EjectController.getTemplates);
router.post('/runtime/eject/:projectId/:template', EjectController.eject);

//assets
router.get('/assets/projectTemplates', AssetController.getProjTemplates);
router.post('/v2/assets/projectTemplates', AssetController.getProjTemplatesV2);
router.get('/assets/templateReadme', AssetController.getTemplateReadMe);

router.use('/assets/locales/', express.static(path.join(__dirname, '..', '..', 'src', 'locales')));

//help api
router.get('/utilities/qna/parse', UtilitiesController.getQnaContent);
// extensions
router.get('/extensions', ExtensionsController.listExtensions);
router.post('/extensions', ExtensionsController.addExtension);
router.delete('/extensions', ExtensionsController.removeExtension);
router.patch('/extensions/toggle', ExtensionsController.toggleExtension);
router.get('/extensions/search', ExtensionsController.searchExtensions);
router.get('/extensions/settings/schema.json', ExtensionsController.getSettingsSchema);
router.get('/extensions/settings', ExtensionsController.getSettings);
router.patch('/extensions/settings', ExtensionsController.updateSettings);
router.get('/extensions/:id/:bundleId', ExtensionsController.getBundleForView);
// proxy route for extensions (allows extension client code to make fetch calls using the Composer server as a proxy -- avoids browser blocking request due to CORS)
router.post('/extensions/proxy/:url', ExtensionsController.performExtensionFetch);

// authentication from client
router.get('/auth/getAccessToken', csrfProtection, AuthController.getAccessToken);
router.get('/auth/logOut', AuthController.logOut);
router.get('/auth/getTenants', csrfProtection, AuthController.getTenants);
router.get('/auth/getARMTokenForTenant', csrfProtection, AuthController.getARMTokenForTenant);

// FeatureFlags
router.get('/featureFlags', FeatureFlagController.getFeatureFlags);
router.post('/featureFlags', FeatureFlagController.updateFeatureFlags);

// importing
router.post('/import/:source', ImportController.startImport);
router.post('/import/:source/authenticate', ImportController.authenticate);
router.post('/import/:source/generateProfile', ImportController.generateProfile);
router.post('/import/:source/getAlias', ImportController.getAlias);

// Process status
router.get('/status/:jobId', StatusController.getStatus);

// User Server Settings
router.get('/settings', SettingsController.getUserSettings);
router.post('/settings', SettingsController.updateUserSettings);

// Telemetry
router.post('/telemetry/events', TelemetryController.track);

// Orchestrator Specific API
router.post('/orchestrator/download', OrchestratorController.downloadDefaultModel);
router.get('/orchestrator/status', OrchestratorController.status);

const errorHandler = (handler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

(router as any).stack.forEach((layer) => {
  if (layer.route == null) return;
  const fn: RequestHandler = layer.route.stack[0].handle;
  layer.route.stack[0].handle = errorHandler(fn);
});

export const apiRouter = router;
