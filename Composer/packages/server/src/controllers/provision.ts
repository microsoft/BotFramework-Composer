// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { Request } from 'express';

import { ExtensionContext } from '../models/extension/extensionContext';
import { authService } from '../services/auth/auth';
import { BotProjectService } from '../services/project';
export const ProvisionController = {
  getResources: async (req, res) => {
    const user = await ExtensionContext.getUserFromRequest(req);
    const type = req.params.type; // type is webapp or functions
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    if (ExtensionContext?.extensions?.publish[type]?.methods?.getResources) {
      // get the externally provision method
      const pluginMethod = ExtensionContext.extensions.publish[type].methods.getResources;
      if (typeof pluginMethod === 'function') {
        try {
          // call the method
          const result = await pluginMethod.call(null, currentProject, user);
          // set status and return value as json
          res.status(200).json(result);
        } catch (err) {
          console.log(err);
          res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    } else {
      res.status(200).json([]);
    }
  },
  provision: async (req: Request, res) => {
    const user = await ExtensionContext.getUserFromRequest(req);
    const type = req.params.type; // type is webapp or functions
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);

    if (ExtensionContext?.extensions?.publish[type]?.methods?.provision) {
      // get the externally provision method
      const pluginMethod = ExtensionContext.extensions.publish[type].methods.provision;
      if (typeof pluginMethod === 'function') {
        try {
          // call the method
          const result = await pluginMethod.call(
            null,
            { ...req.body },
            currentProject,
            user,
            authService.getAccessToken.bind(authService)
          );
          // set status and return value as json
          res.status(result.status).json(result);
        } catch (err) {
          console.log(err);
          res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    } else {
      res.status(400).json({
        statusCode: '400',
        message: 'method not implemented',
      });
    }
  },
  getProvisionStatus: async (req, res) => {
    const type = req.params.type;
    const target: string = req.params.target;
    const user = await ExtensionContext.getUserFromRequest(req);
    const projectId = req.params.projectId;
    const currentProject = await BotProjectService.getProjectById(projectId, user);
    const jobId: string = req.params.jobId;

    if (type && ExtensionContext?.extensions?.publish[type]?.methods?.getProvisionStatus) {
      // get the externally defined method
      const pluginMethod = ExtensionContext.extensions.publish[type].methods.getProvisionStatus;
      if (typeof pluginMethod === 'function') {
        try {
          // call the method
          const result = await pluginMethod.call(null, target, currentProject, user, jobId);
          console.log(result);
          // set status and return value as json
          res.status(result.status).json(result);
        } catch (err) {
          console.log(err);
          res.status(400).json({
            statusCode: '400',
            message: err.message,
          });
        }
      }
    }
  },
};
