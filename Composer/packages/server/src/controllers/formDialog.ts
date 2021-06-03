// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import { expandPropertyDefinition, schemas } from '@microsoft/bf-generate-library';
import { Request, Response } from 'express';
import * as fs from 'fs-extra';

import { ExtensionContext } from '../models/extension/extensionContext';
import { BotProjectService } from '../services/project';

// If we are in electron, the env variable has the asar.unpacked path to the templates
// Otherwise, library uses built in templates path
const getTemplatesRootDir = () =>
  process.env.COMPOSER_FORM_DIALOG_TEMPLATES_DIR ? process.env.COMPOSER_FORM_DIALOG_TEMPLATES_DIR : undefined;

const getTemplateDirs = async () => {
  const templatesRootDir = getTemplatesRootDir();
  const dirs: string[] = [];
  if (templatesRootDir?.length) {
    for (const dirName of await fs.readdir(templatesRootDir)) {
      const dir = path.join(templatesRootDir, dirName);
      if ((await fs.lstat(dir)).isDirectory() && dir.endsWith('standard')) {
        // Add templates subdirectories as templates
        dirs.push(dir);
      }
    }
  }

  return dirs;
};

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

const skipSchemas: string[] = [
  'boolean',
  'date-time',
  'date',
  'email',
  'enum',
  'integer',
  'iri',
  'number',
  'string',
  'time',
  'uri',
];
const getTemplateSchemas = async (req: Request, res: Response) => {
  const templatesDirs = await getTemplateDirs();
  const result = await schemas(templatesDirs);

  if (result !== undefined) {
    // TODO: Filter out base type schemas for now
    const filteredSchemas = {};
    for (const [name, definition] of Object.entries(result)) {
      if (!skipSchemas.includes(name)) {
        filteredSchemas[name] = definition;
      }
    }
    res.status(200).json(filteredSchemas);
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

    const templatesDirs = await getTemplateDirs();

    const result = await currentProject.generateDialog(name, templatesDirs);

    if (!result.success) {
      res.status(500).json({ id: projectId, errors: result.errors });
      return;
    }

    res.status(200).json({ id: projectId });
  } else {
    res.status(404).json({
      message: `Could not generate form dialog. Project ${projectId} not found.`,
    });
  }
};

const deleteDialog = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const dialogId = req.params.dialogId;

  const user = await ExtensionContext.getUserFromRequest(req);

  const currentProject = await BotProjectService.getProjectById(projectId, user);
  if (currentProject !== undefined) {
    try {
      const rootDialogId = currentProject.rootDialogId;
      if (rootDialogId === dialogId) {
        throw new Error('root dialog is not allowed to delete');
      }
      await currentProject.deleteFormDialog(dialogId);
      res.status(200).json({ id: projectId });
    } catch (e) {
      res.status(400).json({
        message: e.message,
      });
    }
  } else {
    res.status(404).json({
      message: `Could not delete form dialog. Project ${projectId} not found.`,
    });
  }
};

export const FormDialogController = {
  getTemplateSchemas,
  generate,
  expandJsonSchemaProperty,
  deleteDialog,
};
