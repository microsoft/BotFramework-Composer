// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import merge from 'lodash/merge';
import { ExtensionContext } from '@bfc/extension';
import { defaultPublishConfig } from '@bfc/shared';
import { join } from 'path';
import { ensureDirSync, removeSync } from 'fs-extra';
import extractZip from 'extract-zip';

import { BotProjectService } from '../services/project';
import { copyDir } from '../utility/storage';
import { authService } from '../services/auth';

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
            },
          };
        })
    );
  },
  publish: async (req, res) => {
    const target = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const { metadata, sensitiveSettings } = req.body;
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // deal with publishTargets not exist in settings
    const publishTargets = currentProject.settings?.publishTargets || [];
    const allTargets = [defaultPublishConfig, ...publishTargets];

    const profiles = allTargets.filter((t) => t.name === target);
    const profile = profiles.length ? profiles[0] : undefined;
    const extensionName = profile ? profile.type : ''; // get the publish plugin key

    if (profile && extensionImplementsMethod(extensionName, 'publish')) {
      // append config from client(like sensitive settings)
      const configuration = {
        profileName: profile.name,
        fullSettings: merge({}, currentProject.settings, sensitiveSettings),
        ...JSON.parse(profile.configuration),
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
          authService.getAccessToken
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
          statusCode: '400',
          message: err.message,
        });
      }
    } else {
      res.status(400).json({
        statusCode: '400',
        message: `${extensionName} is not a valid publishing target type. There may be a missing plugin.`,
      });
    }
  },
  status: async (req, res) => {
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
    if (profile && extensionImplementsMethod(extensionName, 'getStatus')) {
      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.getStatus;

      if (typeof pluginMethod === 'function') {
        const configuration = {
          profileName: profile.name,
          ...JSON.parse(profile.configuration),
        };

        // call the method
        const results = await pluginMethod.call(null, configuration, currentProject, user, authService.getAccessToken);
        // update the eTag if the publish was completed and an eTag is provided
        if (results.status === 200 && results.result?.eTag) {
          BotProjectService.setETagForProject(results.result.eTag, projectId);
        }
        // copy status into payload for ease of access in client
        const response = {
          ...results.result,
          status: results.status,
        };

        // set status and return value as json
        return res.status(results.status).json(response);
      }
    }

    res.status(400).json({
      statusCode: '400',
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

    if (profile && extensionImplementsMethod(extensionName, 'history')) {
      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[extensionName].methods.history;
      if (typeof pluginMethod === 'function') {
        const configuration = {
          profileName: profile.name,
          ...JSON.parse(profile.configuration),
        };

        // call the method
        const results = await pluginMethod.call(null, configuration, currentProject, user, authService.getAccessToken);

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

          // copy status into payload for ease of access in client
          const response = {
            ...results.result,
            status: results.status,
          };

          // set status and return value as json
          return res.status(results.status).json(response);
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
    const target = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    // deal with publishTargets not exist in settings
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
            authService.getAccessToken
          );
          if (results.status === 500) {
            // something went wrong
            console.error(results.error?.message);
            return res.status(500).send(results.error?.message);
          }
          if (!results.zipPath) {
            // couldn't get zip from publish target
            return res.status(500);
          }

          // TODO: stop current bot project from running?

          // wipe old .backup if present
          const backupDir = join(currentProject.dir, '.backup');
          await removeSync(backupDir);

          // copy current bot project contents into botProject/.backup
          await ensureDirSync(backupDir);
          await copyDir(currentProject.dir, currentProject.fileStorage, backupDir, currentProject.fileStorage); // .backup might get duplicated?

          // extract downloaded assets into bot project
          await extractZip(results.zipPath, { dir: currentProject.dir });

          // update eTag
          BotProjectService.setETagForProject(results.eTag as string, projectId); // TODO: uncast this etag

          return res.status(200);
        } catch (err) {
          return res.status(400).json({
            statusCode: '500',
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
