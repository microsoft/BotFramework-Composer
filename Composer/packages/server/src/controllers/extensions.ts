// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { ExtensionManager, ExtensionMetadata } from '@bfc/extension';

interface AddExtensionRequest extends Request {
  body: {
    id?: string;
    version?: string;
    path?: string;
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
    bundleId: string;
  };
}

interface ExtensionFetchRequest extends Request {
  body: RequestInit;
  params: {
    url: string;
  };
}

const presentExtension = (e?: ExtensionMetadata) => (e ? { ...e, bundles: undefined, path: undefined } : undefined);

export async function listExtensions(req: Request, res: Response) {
  const extensions = ExtensionManager.getAll().map(presentExtension);
  res.json(extensions);
}

export async function addExtension(req: AddExtensionRequest, res: Response) {
  const { id, version } = req.body;

  if (!id) {
    res.status(400).json({ error: '`id` is missing from body' });
    return;
  }

  const extensionId = await ExtensionManager.installRemote(id, version);

  if (extensionId) {
    await ExtensionManager.load(extensionId);
    const extension = ExtensionManager.find(extensionId);
    res.json(presentExtension(extension));
  } else {
    res.status(500).json({ error: 'Unable to install extension.' });
  }
}

export async function toggleExtension(req: ToggleExtensionRequest, res: Response) {
  const { id, enabled } = req.body;

  if (!id) {
    res.status(400).json({ error: '`id` is missing from body' });
    return;
  }

  if (!ExtensionManager.find(id)) {
    res.status(404).json({ error: `extension \`${id}\` not found` });
    return;
  }

  if (enabled === true) {
    await ExtensionManager.enable(id);
  } else {
    await ExtensionManager.disable(id);
  }

  const extension = ExtensionManager.find(id);
  res.json(presentExtension(extension));
}

export async function removeExtension(req: RemoveExtensionRequest, res: Response) {
  const { id } = req.body;

  if (!id) {
    res.status(400).json({ error: '`id` is missing from body' });
    return;
  }

  if (!ExtensionManager.find(id)) {
    res.status(404).json({ error: `extension \`${id}\` not found` });
    return;
  }

  await ExtensionManager.remove(id);
  res.json(ExtensionManager.getAll().map(presentExtension));
}

export async function searchExtensions(req: SearchExtensionsRequest, res: Response) {
  const { q } = req.query;

  const results = await ExtensionManager.search(q ?? '');
  res.json(results);
}

export async function getBundleForView(req: ExtensionViewBundleRequest, res: Response) {
  const { id, bundleId } = req.params;

  const extension = ExtensionManager.find(id);

  if (extension) {
    const bundle = ExtensionManager.getBundle(id, bundleId);
    if (bundle) {
      res.sendFile(bundle);
      return;
    }
  }

  res.status(404).json({ error: 'extension or bundle not found' });
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
