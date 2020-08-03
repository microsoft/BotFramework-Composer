// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { PluginLoader } from '@bfc/plugin-loader';
import { schemas, expandPropertyDefinition } from '@microsoft/bf-generate-library';

import { BotProjectService } from '../services/project';

const expandJsonSchemaProperty = async (req: Request, res: Response) => {
  const { propertyName, schema } = req.body;
  const result = await expandPropertyDefinition(propertyName, schema);

  if (result !== undefined) {
    res.status(200).json(result);
  } else {
    res.status(404).json({
      message: 'Failed to get form dialog schema/property.',
    });
  }
};

const getTemplateSchemas = async (req: Request, res: Response) => {
  const result = await schemas();

  if (result !== undefined) {
    res.status(200).json(result);
  } else {
    res.status(404).json({
      message: 'Failed to get form dialog schemas.',
    });
  }
};

const generate = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const user = await PluginLoader.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const { name, schema } = req.body;

    await currentProject.generateDialog(name, JSON.stringify(schema));
    const updatedProject = await BotProjectService.getProjectById(projectId, user);
    res.status(200).json(updatedProject);
  } else {
    res.status(404).json({
      message: 'No such bot project opened',
    });
  }
};

export const FormDialogController = {
  getTemplateSchemas,
  generate,
  expandJsonSchemaProperty,
};
