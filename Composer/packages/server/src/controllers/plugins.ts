// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';

import { PluginManager } from '../models/plugins';

interface AddPluginRequest extends Request {
  body: {
    name?: string;
    version?: string;
  };
}

interface TogglePluginRequest extends Request {
  body: {
    id?: string;
    enabled?: boolean;
  };
}

interface RemovePluginRequest extends Request {
  body: {
    id?: string;
  };
}

export async function listPlugins(req: Request, res: Response) {
  res.json(PluginManager.getAll());
}

export async function addPlugin(req: AddPluginRequest, res: Response) {
  const { name, version } = req.body;

  if (!name) {
    res.status(400).send({ error: '`name` is missing from body' });
    return;
  }

  await PluginManager.install(name, version);
  await PluginManager.load(name);
  res.status(202).end();
}

export async function togglePlugin(req: TogglePluginRequest, res: Response) {
  const { id, enabled } = req.body;

  if (!id) {
    res.status(400).send({ error: '`id` is missing from body' });
    return;
  }

  if (enabled === true) {
    await PluginManager.enable(id);
  } else {
    await PluginManager.disable(id);
  }

  res.status(200).end();
}

export async function removePlugin(req: RemovePluginRequest, res: Response) {
  const { id } = req.body;

  if (!id) {
    res.status(400).send({ error: '`id` is missing from body' });
    return;
  }

  await PluginManager.remove(id);
  res.status(200).end();
}
