// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { ExtensionManager } from '@bfc/extension';

import * as ExtensionsController from '../extensions';

jest.mock('@bfc/extension', () => ({
  ExtensionManager: {
    disable: jest.fn(),
    enable: jest.fn(),
    find: jest.fn(),
    getAll: jest.fn(),
    getBundle: jest.fn(),
    installRemote: jest.fn(),
    load: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  },
}));

const req: Request = {} as Request;
let res: Response = {} as Response;

beforeEach(() => {
  res = ({
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
  } as unknown) as Response;
});

describe('listing all extensions', () => {
  it('returns all extensions', () => {
    (ExtensionManager.getAll as jest.Mock).mockReturnValue(['list', 'of', 'extensions']);

    ExtensionsController.listExtensions(req, res);
    expect(res.json).toHaveBeenCalledWith(['list', 'of', 'extensions']);
  });
});

describe('adding an extension', () => {
  const name = 'new-extension';

  it('validates name parameter', async () => {
    await ExtensionsController.addExtension({ body: { name: '' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('installs a remote extension', async () => {
    await ExtensionsController.addExtension({ body: { name, version: 'some-version' } } as Request, res);

    expect(ExtensionManager.installRemote).toHaveBeenCalledWith(name, 'some-version');
  });

  it('loads the extension', async () => {
    await ExtensionsController.addExtension({ body: { name } } as Request, res);

    expect(ExtensionManager.load).toHaveBeenCalledWith(name);
  });

  it('returns the extension', async () => {
    (ExtensionManager.find as jest.Mock).mockReturnValue('installed extension');
    await ExtensionsController.addExtension({ body: { name } } as Request, res);

    expect(ExtensionManager.find).toHaveBeenCalledWith(name);
    expect(res.json).toHaveBeenCalledWith('installed extension');
  });
});

describe('toggling an extension', () => {
  it('validates id parameter', async () => {
    await ExtensionsController.toggleExtension({ body: { id: '' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('returns a 404 if the extension is not found', async () => {
    (ExtensionManager.find as jest.Mock).mockReturnValue(null);
    await ExtensionsController.toggleExtension({ body: { id: 'does-not-exist' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  describe('when extension is found', () => {
    const id = 'extension-id';

    beforeEach(() => {
      (ExtensionManager.find as jest.Mock).mockReturnValue('found extension');
    });

    it('can enable an extension', async () => {
      await ExtensionsController.toggleExtension({ body: { id, enabled: true } } as Request, res);
      expect(ExtensionManager.enable).toBeCalledWith(id);
    });

    it('can disable an extension', async () => {
      await ExtensionsController.toggleExtension({ body: { id, enabled: false } } as Request, res);
      await ExtensionsController.toggleExtension({ body: { id, enabled: 'true' } } as Request, res);
      await ExtensionsController.toggleExtension({ body: { id, enabled: '' } } as Request, res);
      await ExtensionsController.toggleExtension({ body: { id, enabled: 1 } } as Request, res);
      expect(ExtensionManager.disable).toBeCalledTimes(4);
    });

    it('returns the updated extension', async () => {
      await ExtensionsController.toggleExtension({ body: { id, enabled: true } } as Request, res);

      expect(res.json).toBeCalledWith('found extension');
    });
  });
});

describe('removing an extension', () => {
  it('validates id parameter', async () => {
    await ExtensionsController.removeExtension({ body: { id: '' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('returns a 404 if the extension is not found', async () => {
    (ExtensionManager.find as jest.Mock).mockReturnValue(null);
    await ExtensionsController.removeExtension({ body: { id: 'does-not-exist' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  describe('when extension is found', () => {
    const id = 'extension-id';

    beforeEach(() => {
      (ExtensionManager.find as jest.Mock).mockReturnValue('found extension');
    });

    it('removes the extension', async () => {
      await ExtensionsController.removeExtension({ body: { id } } as Request, res);
      expect(ExtensionManager.remove).toHaveBeenCalledWith(id);
    });

    it('returns the list of extensions', async () => {
      (ExtensionManager.getAll as jest.Mock).mockReturnValue(['list', 'of', 'extensions']);

      await ExtensionsController.removeExtension({ body: { id } } as Request, res);
      expect(res.json).toHaveBeenCalledWith(['list', 'of', 'extensions']);
    });
  });
});

describe('searching extensions', () => {
  it('returns the search result', async () => {
    (ExtensionManager.search as jest.Mock).mockReturnValue(['search', 'results']);
    await ExtensionsController.searchExtensions({ query: { q: 'search query' } } as Request, res);

    expect(ExtensionManager.search).toHaveBeenCalledWith('search query');
    expect(res.json).toHaveBeenCalledWith(['search', 'results']);
  });
});

describe('getting a view bundle', () => {
  it('validates id parameter', async () => {
    await ExtensionsController.getBundleForView({ params: { id: '' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('validates view parameter', async () => {
    await ExtensionsController.getBundleForView({ params: { id: 'some-id', view: '' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('returns 404 if extension not found', async () => {
    (ExtensionManager.find as jest.Mock).mockReturnValue(null);
    await ExtensionsController.getBundleForView({ params: { id: 'does-not-exist', view: 'some-id' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  describe('when extension found', () => {
    const id = 'extension-id';
    const viewId = 'view-id';
    const bundleId = 'bundle-id';

    beforeEach(() => {
      (ExtensionManager.find as jest.Mock).mockReturnValue({
        contributes: {
          views: {
            [viewId]: {
              bundleId,
            },
          },
        },
      });
    });

    it('returns a 404 if bundle not found', async () => {
      (ExtensionManager.getBundle as jest.Mock).mockReturnValue(null);
      await ExtensionsController.getBundleForView({ params: { id, view: viewId } } as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('sends the javascript bundle', async () => {
      (ExtensionManager.getBundle as jest.Mock).mockReturnValue('js bundle path');
      await ExtensionsController.getBundleForView({ params: { id, view: viewId } } as Request, res);

      expect(res.sendFile).toHaveBeenCalledWith('js bundle path');
    });
  });
});

describe('proxying extension requests', () => {
  it.todo('proxies requests from extensions');
});
