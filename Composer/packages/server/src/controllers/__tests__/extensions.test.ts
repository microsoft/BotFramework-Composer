// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Request, Response } from 'express';
import { ExtensionManager, ExtensionMetadata } from '@bfc/extension';

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

const mockExtension1 = {
  id: 'remoteExtension1',
  name: 'Extension 1',
  version: '1.0.0',
  enabled: true,
  path: '/some/path/extension1',
  description: 'description text',
  bundles: [
    {
      id: 'page1',
      path: 'some/path',
    },
  ],
  contributes: {
    views: {
      publish: [
        {
          bundleId: '',
        },
      ],
      pages: [
        {
          bundleId: 'page1',
          label: 'Page 1',
          icon: 'SomeIcon',
        },
      ],
    },
  },
};

const allExtensions: ExtensionMetadata[] = [
  mockExtension1,
  {
    id: 'builtinExtension2',
    name: 'Extension 2',
    version: '1.0.0',
    path: '/some/path/extension2',
    description: 'description text',
    enabled: true,
    builtIn: true,
    bundles: [
      {
        id: 'page2',
        path: 'some/path',
      },
    ],
    contributes: {
      views: {
        publish: [
          {
            bundleId: '',
          },
        ],
        pages: [
          {
            bundleId: 'page2',
            label: 'Page 2',
            icon: 'SomeOtherIcon',
          },
        ],
      },
    },
  },
];
describe('listing all extensions', () => {
  it('returns all extensions with sensitive properties removed', () => {
    (ExtensionManager.getAll as jest.Mock).mockReturnValue(allExtensions);

    ExtensionsController.listExtensions(req, res);
    expect(res.json).toHaveBeenCalledWith([
      {
        id: 'remoteExtension1',
        name: 'Extension 1',
        version: '1.0.0',
        enabled: true,
        description: 'description text',
        contributes: {
          views: {
            publish: [
              {
                bundleId: '',
              },
            ],
            pages: [
              {
                bundleId: 'page1',
                label: 'Page 1',
                icon: 'SomeIcon',
              },
            ],
          },
        },
        bundles: undefined,
        path: undefined,
      },
      {
        id: 'builtinExtension2',
        name: 'Extension 2',
        version: '1.0.0',
        enabled: true,
        builtIn: true,
        description: 'description text',
        contributes: {
          views: {
            publish: [
              {
                bundleId: '',
              },
            ],
            pages: [
              {
                bundleId: 'page2',
                label: 'Page 2',
                icon: 'SomeOtherIcon',
              },
            ],
          },
        },
        bundles: undefined,
        path: undefined,
      },
    ]);
  });
});

describe('adding an extension', () => {
  const id = 'new-extension';

  it('validates id parameter', async () => {
    await ExtensionsController.addExtension({ body: { id: '' } } as Request, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  it('installs a remote extension', async () => {
    await ExtensionsController.addExtension({ body: { id, version: 'some-version' } } as Request, res);

    expect(ExtensionManager.installRemote).toHaveBeenCalledWith(id, 'some-version');
  });

  describe('installed successfully', () => {
    beforeEach(() => {
      (ExtensionManager.installRemote as jest.Mock).mockResolvedValue(id);
    });

    it('loads the extension', async () => {
      await ExtensionsController.addExtension({ body: { id } } as Request, res);

      expect(ExtensionManager.load).toHaveBeenCalledWith(id);
    });

    it('returns the extension', async () => {
      (ExtensionManager.find as jest.Mock).mockReturnValue(mockExtension1);
      await ExtensionsController.addExtension({ body: { id } } as Request, res);

      expect(ExtensionManager.find).toHaveBeenCalledWith(id);
      expect(res.json).toHaveBeenCalledWith({
        ...mockExtension1,
        bundles: undefined,
        path: undefined,
      });
    });
  });

  describe('install fails', () => {
    beforeEach(() => {
      (ExtensionManager.installRemote as jest.Mock).mockResolvedValue(undefined);
    });

    it('returns an error', async () => {
      await ExtensionsController.addExtension({ body: { id } } as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });
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
      (ExtensionManager.find as jest.Mock).mockReturnValue(mockExtension1);
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

      expect(res.json).toHaveBeenCalledWith({
        ...mockExtension1,
        bundles: undefined,
        path: undefined,
      });
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
      (ExtensionManager.find as jest.Mock).mockReturnValue(mockExtension1);
    });

    it('removes the extension', async () => {
      await ExtensionsController.removeExtension({ body: { id } } as Request, res);
      expect(ExtensionManager.remove).toHaveBeenCalledWith(id);
    });

    it('returns the list of extensions', async () => {
      (ExtensionManager.getAll as jest.Mock).mockReturnValue([mockExtension1]);

      await ExtensionsController.removeExtension({ body: { id } } as Request, res);
      expect(res.json).toHaveBeenCalledWith([
        {
          ...mockExtension1,
          bundles: undefined,
          path: undefined,
        },
      ]);
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
  it('returns 404 if extension not found', async () => {
    (ExtensionManager.find as jest.Mock).mockReturnValue(null);
    await ExtensionsController.getBundleForView(
      { params: { id: 'does-not-exist', bundleId: 'some-id' } } as Request,
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
  });

  describe('when extension found', () => {
    const id = 'extension-id';
    const bundleId = 'bundle-id';

    beforeEach(() => {
      (ExtensionManager.find as jest.Mock).mockReturnValue(id);
    });

    it('returns a 404 if bundle not found', async () => {
      (ExtensionManager.getBundle as jest.Mock).mockReturnValue(null);
      await ExtensionsController.getBundleForView({ params: { id, bundleId } } as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: expect.any(String) });
    });

    it('sends the javascript bundle', async () => {
      (ExtensionManager.getBundle as jest.Mock).mockReturnValue('js bundle path');
      await ExtensionsController.getBundleForView({ params: { id, bundleId } } as Request, res);

      expect(res.sendFile).toHaveBeenCalledWith('js bundle path');
    });
  });
});

describe('proxying extension requests', () => {
  it.todo('proxies requests from extensions');
});
