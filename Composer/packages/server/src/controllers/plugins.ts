// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { PluginManager } from '@bfc/plugin-loader';

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

interface SearchPluginsRequest extends Request {
  query: {
    q?: string;
  };
}

interface PluginViewBundleRequest extends Request {
  params: {
    id: string;
    view: string;
  };
}

interface PluginFetchRequest extends Request {
  body: RequestInit;
  params: {
    url: string;
  };
}

export async function listPlugins(req: Request, res: Response) {
  res.json(PluginManager.getAll()); // might need to have this list all enabled plugins ?
}

export async function addPlugin(req: AddPluginRequest, res: Response) {
  const { name, version } = req.body;

  if (!name) {
    res.status(400).send({ error: '`name` is missing from body' });
    return;
  }

  await PluginManager.installRemote(name, version);
  await PluginManager.load(name);
  res.json(PluginManager.find(name));
}

export async function togglePlugin(req: TogglePluginRequest, res: Response) {
  const { id, enabled } = req.body;

  if (!id) {
    res.status(400).json({ error: '`id` is missing from body' });
    return;
  }

  if (!PluginManager.find(id)) {
    res.status(404).json({ error: `plugin \`${id}\` not found` });
    return;
  }

  if (enabled === true) {
    await PluginManager.enable(id);
  } else {
    await PluginManager.disable(id);
  }

  res.json(PluginManager.find(id));
}

export async function removePlugin(req: RemovePluginRequest, res: Response) {
  const { id } = req.body;

  if (!id) {
    res.status(400).send({ error: '`id` is missing from body' });
    return;
  }

  if (!PluginManager.find(id)) {
    res.status(404).json({ error: `plugin \`${id}\` not found` });
    return;
  }

  await PluginManager.remove(id);
  res.json(PluginManager.getAll());
}

export async function searchPlugins(req: SearchPluginsRequest, res: Response) {
  const { q } = req.query;

  const results = await PluginManager.search(q ?? '');
  res.json(results);
}

export async function getBundleForView(req: PluginViewBundleRequest, res: Response) {
  const { id, view } = req.params;
  const plugin = PluginManager.find(id);
  const bundleId = plugin.contributes.views?.[view].bundleId as string;
  const bundle = PluginManager.getBundle(id, bundleId);
  if (bundle) {
    res.sendFile(bundle);
  } else {
    res.status(404);
  }
}

export async function performPluginFetch(req: PluginFetchRequest, res: Response) {
  const { url } = req.params;
  const options = req.body;
  if (!url || !options) {
    return res.status(400).send('Missing URL or request options.');
  }
  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      throw response;
    }
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return res.send(text);
    }
    const json = await response.json();
    res.json(json);
  } catch (e) {
    let error = e;
    if (e && e.json) {
      error = await e.json();
    }
    res.status(500).send(error);
  }
}
