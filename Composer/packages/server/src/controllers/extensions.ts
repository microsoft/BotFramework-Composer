// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { PluginManager } from '@bfc/plugin-loader';

interface AddExtensionRequest extends Request {
  body: {
    name?: string;
    version?: string;
  };
}

interface ToggleExtensionRequest extends Request {
  body: {
    id?: string;
    enabled?: boolean;
  };
}

interface RemoveExtensionRequest extends Request {
  body: {
    id?: string;
  };
}

interface SearchExtensionsRequest extends Request {
  query: {
    q?: string;
  };
}

interface ExtensionViewBundleRequest extends Request {
  params: {
    id: string;
    view: string;
  };
}

interface ExtensionFetchRequest extends Request {
  body: RequestInit;
  params: {
    url: string;
  };
}

export async function listExtensions(req: Request, res: Response) {
  res.json(PluginManager.getAll()); // might need to have this list all enabled extensions ?
}

export async function addExtension(req: AddExtensionRequest, res: Response) {
  const { name, version } = req.body;

  if (!name) {
    res.status(400).send({ error: '`name` is missing from body' });
    return;
  }

  await PluginManager.installRemote(name, version);
  await PluginManager.load(name);
  res.json(PluginManager.find(name));
}

export async function toggleExtension(req: ToggleExtensionRequest, res: Response) {
  const { id, enabled } = req.body;

  if (!id) {
    res.status(400).json({ error: '`id` is missing from body' });
    return;
  }

  if (!PluginManager.find(id)) {
    res.status(404).json({ error: `extension \`${id}\` not found` });
    return;
  }

  if (enabled === true) {
    await PluginManager.enable(id);
  } else {
    await PluginManager.disable(id);
  }

  res.json(PluginManager.find(id));
}

export async function removeExtension(req: RemoveExtensionRequest, res: Response) {
  const { id } = req.body;

  if (!id) {
    res.status(400).send({ error: '`id` is missing from body' });
    return;
  }

  if (!PluginManager.find(id)) {
    res.status(404).json({ error: `extension \`${id}\` not found` });
    return;
  }

  await PluginManager.remove(id);
  res.json(PluginManager.getAll());
}

export async function searchExtensions(req: SearchExtensionsRequest, res: Response) {
  const { q } = req.query;

  const results = await PluginManager.search(q ?? '');
  res.json(results);
}

export async function getBundleForView(req: ExtensionViewBundleRequest, res: Response) {
  const { id, view } = req.params;
  const extension = PluginManager.find(id);
  const bundleId = extension.contributes.views?.[view].bundleId as string;
  const bundle = PluginManager.getBundle(id, bundleId);
  if (bundle) {
    res.sendFile(bundle);
  } else {
    res.status(404);
  }
}

export async function performExtensionFetch(req: ExtensionFetchRequest, res: Response) {
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
