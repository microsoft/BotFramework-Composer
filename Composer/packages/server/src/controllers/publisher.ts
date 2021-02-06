// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { join } from 'path';

import merge from 'lodash/merge';
import { defaultPublishConfig, PublishResult } from '@bfc/shared';
import { ensureDirSync, remove } from 'fs-extra';
import extractZip from 'extract-zip';

import { ExtensionContext } from '../models/extension/extensionContext';
import { BotProjectService } from '../services/project';
import { authService } from '../services/auth/auth';
import AssetService from '../services/asset';
import logger from '../logger';
import { LocationRef } from '../models/bot/interface';
import { TelemetryService } from '../services/telemetry';

const log = logger.extend('publisher-controller');

function extensionImplementsMethod(extensionName: string, methodName: string): boolean {
  return extensionName && ExtensionContext.extensions.publish[extensionName]?.methods[methodName];
}

export const PublishController = {
  getTypes: async (req, res) => {
    res.json(
      Object.values(ExtensionContext.extensions.publish)
        .filter((extension) => extension.plugin.name !== defaultPublishConfig.type)
        .map((extension) => {
          const { plugin, methods } = extension;

          return {
            name: plugin.name,
            description: plugin.description,
            instructions: plugin.instructions,
            schema: plugin.schema,
            extensionId: plugin.extensionId,
            bundleId: plugin.bundleId,
            features: {
              history: typeof methods.history === 'function',
              publish: typeof methods.publish === 'function',
              status: typeof methods.getStatus === 'function',
              rollback: typeof methods.rollback === 'function',
              pull: typeof methods.pull === 'function',
              provision: typeof methods.provision === 'function',
              getProvisionStatus: typeof methods.getProvisionStatus === 'function',
            },
          };
        })
    );
  },
  publish: async (req, res) => {
    const target: string = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const { accessToken = '', metadata, sensitiveSettings } = req.body;
    const projectId: string = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    TelemetryService.trackEvent('PublishingProfileStarted', { target, projectId });
    TelemetryService.startEvent('PublishingProfileCompleted', target + projectId, { target, projectId });

    // deal with publishTargets not exist in settings
    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    const extensionName = profile ? profile.type : ''; // get the publish plugin key

    log('access token retrieved from body: %s', accessToken || 'no token provided');
    if (profile && extensionImplementsMethod(extensionName, 'publish')) {
      // append config from client(like sensitive settings)
      const configuration = {
        profileName: profile.name,
        fullSettings: merge({}, currentProject.settings, sensitiveSettings),
        ...JSON.parse(profile.configuration),
        accessToken,
      };

      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.publish;

      try {
        // call the method
        const results = await pluginMethod.call(
          null,
          configuration,
          currentProject,
          metadata,
          user,
          authService.getAccessToken.bind(authService)
        );

        // copy status into payload for ease of access in client
        const response = {
          ...results.result,
          status: results.status,
        };

        // set status and return value as json
        res.status(results.status).json(response);
      } catch (err) {
        res.status(400).json({
          status: '400',
          message: err.message,
        });
      }
    } else {
      res.status(400).json({
        status: '400',
        message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
      });
    }
  },
  status: async (req, res) => {
    const target = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const jobId = req.params.jobId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    // get the publish plugin key
    const extensionName = profile ? profile.type : '';
    if (profile && extensionImplementsMethod(extensionName, 'getStatus')) {
      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.getStatus;

      if (typeof pluginMethod === 'function') {
        const configuration = {
          profileName: profile.name,
          jobId: jobId,
          ...JSON.parse(profile.configuration),
        };

        // call the method
        const results = await pluginMethod.call(
          null,
          configuration,
          currentProject,
          user,
          authService.getAccessToken.bind(authService)
        );
        // update the eTag if the publish was completed and an eTag is provided
        if (results.status === 200) {
          TelemetryService.endEvent('PublishingProfileCompleted', target + projectId);
          if (results.result?.eTag) {
            BotProjectService.setProjectLocationData(projectId, { eTag: results.result.eTag });
          }
        }
        // copy status into payload for ease of access in client
        const response: PublishResult = {
          ...results.result,
          status: results.status,
        };

        // set status and return value as json
        return res.status(results.status).json(response);
      }
    }

    res.status(400).json({
      status: '400',
      message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },
  history: async (req, res) => {
    const target = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    // get the publish plugin key
    const extensionName = profile ? profile.type : '';

    if (profile && extensionImplementsMethod(extensionName, 'getHistory')) {
      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.getHistory;
      if (typeof pluginMethod === 'function') {
        const configuration = {
          profileName: profile.name,
          ...JSON.parse(profile.configuration),
        };

        // call the method
        const results = await pluginMethod.call(
          null,
          configuration,
          currentProject,
          user,
          authService.getAccessToken.bind(authService)
        );

        // set status and return value as json
        return res.status(200).json(results);
      }
    }

    res.status(400).json({
      statusCode: '400',
      message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },
  rollback: async (req, res) => {
    const target = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const { version, sensitiveSettings } = req.body;
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // deal with publishTargets not exist in settings
    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    // get the publish plugin key
    const extensionName = profile ? profile.type : '';

    if (profile && extensionImplementsMethod(extensionName, 'rollback')) {
      // append config from client(like sensitive settings)
      const configuration = {
        profileName: profile.name,
        fullSettings: merge({}, currentProject.settings, sensitiveSettings),
        ...JSON.parse(profile.configuration),
      };
      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.rollback;
      if (typeof pluginMethod === 'function') {
        try {
          // call the method
          const results = await pluginMethod.call(null, configuration, currentProject, version, user);

          // set status and return value as json
          return res.status(results.status).json(results);
        } catch (err) {
          return res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    }

    res.status(400).json({
      statusCode: '400',
      message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },
  removeLocalRuntimeData: async (req, res) => {
    const projectId = req.params.projectId;
    const profile = defaultPublishConfig;
    const extensionName = profile.type;
    if (profile && extensionImplementsMethod(extensionName, 'stopBot')) {
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.stopBot;
      if (typeof pluginMethod === 'function') {
        try {
          await pluginMethod.call(null, projectId);
        } catch (err) {
          return res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    }
    if (profile && extensionImplementsMethod(extensionName, 'removeRuntimeData')) {
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.removeRuntimeData;
      if (typeof pluginMethod === 'function') {
        try {
          const result = await pluginMethod.call(null, projectId);
          return res.status(200).json({ message: result.msg });
        } catch (err) {
          return res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    }
    res.status(400).json({
      statusCode: '400',
      message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },

  stopBot: async (req, res) => {
    const projectId = req.params.projectId;
    const profile = defaultPublishConfig;
    const extensionName = profile.type;
    if (profile && extensionImplementsMethod(extensionName, 'stopBot')) {
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.stopBot;
      if (typeof pluginMethod === 'function') {
        try {
          await pluginMethod.call(null, projectId);
          return res.status(200).json({ message: 'stop bot success' });
        } catch (err) {
          return res.status(500).json({
            statusCode: '500',
            message: err.message,
          });
        }
      }
    }
    res.status(400).json({
      statusCode: '400',
      message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
    });
  },

  pull: async (req, res) => {
    log('Starting pull');
    const target = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // deal with publishTargets not existing in settings
    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    const extensionName = profile ? profile.type : ''; // get the publish plugin key

    if (profile && extensionImplementsMethod(extensionName, 'pull')) {
      const configuration = {
        profileName: profile.name,
        fullSettings: merge({}, currentProject.settings),
        ...JSON.parse(profile.configuration),
      };

      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.pull;

      if (typeof pluginMethod === 'function') {
        try {
          // call the method
          const results = await pluginMethod.call(
            null,
            configuration,
            currentProject,
            user,
            authService.getAccessToken.bind(authService)
          );
          if (results.status === 500) {
            // something went wrong
            log('Error while trying to pull: %s', results.error?.message);
            return res.status(500).send(results.error?.message);
          }
          if (!results.zipPath) {
            // couldn't get zip from publish target
            return res.status(500).json({ message: 'Could not get .zip from publishing target.' });
          }

          // backup the current bot project contents
          const backupLocation = await BotProjectService.backupProject(currentProject);

          // extract zip into new "template" directory
          const baseDir = process.env.COMPOSER_TEMP_DIR as string;
          const templateDir = join(baseDir, 'extractedTemplate-' + Date.now());
          ensureDirSync(templateDir);
          log('Extracting pulled assets into temp template folder %s ', templateDir);
          await extractZip(results.zipPath, { dir: templateDir });

          // TODO (toanzian): abstract away the template copying logic so that the code can be shared between project and publisher controllers
          // (see copyTemplateToExistingProject())
          log('Cleaning up bot content at %s before copying pulled content over.', currentProject.dir);
          await currentProject.fileStorage.rmrfDir(currentProject.dir);

          // copy extracted template content into bot project
          const locationRef: LocationRef = {
            storageId: 'default',
            path: currentProject.dir,
          };
          log('Copying content from template at %s to %s', templateDir, currentProject.dir);
          await AssetService.manager.copyRemoteProjectTemplateTo(
            templateDir,
            locationRef,
            user,
            undefined // TODO: re-enable once we figure out path issue currentProject.settings?.defaultLanguage || 'en-us'
          );
          log('Copied template content successfully.');
          // clean up the temporary template & zip directories -- fire and forget
          remove(templateDir);
          remove(results.zipPath);

          // update eTag
          log('Updating etag.');
          BotProjectService.setProjectLocationData(projectId, { eTag: results.eTag });

          log('Pull successful');

          return res.status(200).json({
            backupLocation,
          });
        } catch (err) {
          return res.status(500).json({
            message: err.message,
          });
        }
      }
      return res.status(501); // not implemented
    } else {
      return res.status(400).json({
        statusCode: '400',
        message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
      });
    }
  },
};
