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

export async function addPlugin(req: AddPluginRequest, res: Response) {
  const { name, version } = req.body;

  if (!name) {
    res.status(400).send({ error: 'Name is missing from body' });
    return;
  }

  await PluginManager.install(name, version);
  res.status(202).end();
}
