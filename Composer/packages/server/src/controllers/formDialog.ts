// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { ExtensionContext } from '@bfc/extension';
import { schemas, expandPropertyDefinition } from '@microsoft/bf-generate-library';

import { BotProjectService } from '../services/project';

// If we are in electron, the env variable has the asar.unpacked path to the templates
// Otherwise, library uses built in templates path
const getTemplatesRootDir = () =>
  process.env.COMPOSER_FORM_DIALOG_TEMPLATES_DIR ? [process.env.COMPOSER_FORM_DIALOG_TEMPLATES_DIR] : undefined;

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
  const result = await schemas(getTemplatesRootDir());

  if (result !== undefined) {
    res.status(200).json(result);
  } else {
    res.status(404).json({
      message: 'Failed to retrieve form dialog template schemas.',
    });
  }
};

const generate = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    const { name } = req.body;

    await currentProject.generateDialog(name);
    const updatedProject = await BotProjectService.getProjectById(projectId, user);
    res.status(200).json({ id: projectId, ...updatedProject.getProject() });
  } else {
    res.status(404).json({
      message: `Could not generate form dialog. Project ${projectId} not found.`,
    });
  }
};

export const FormDialogController = {
  getTemplateSchemas,
  generate,
  expandJsonSchemaProperty,
};
