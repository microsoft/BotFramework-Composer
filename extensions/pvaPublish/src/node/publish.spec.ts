// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { publish } from './publish';

const mockFetch = jest.fn();
jest.mock('node-fetch', () => {
  return async (...args) => await mockFetch(args);
});

const mockPublishConfig: any = {
  profileName: 'Publish to Power Virtual Agents',
  baseUrl: 'https://bots.int.customercareintelligence.net/',
  botId: 'myBotId',
  envId: 'myEnvId',
  tenantId: 'myTenantId',
  deleteMissingDependencies: false,
};
const mockBotProject: any = {
  exportToZip: jest.fn((options, cb) => {
    const archive = {
      on: jest.fn((eventName, handler) => {
        if (eventName === 'end') {
          handler();
        }
      }),
      pipe: jest.fn(),
      unpipe: jest.fn(),
    };
    cb(archive);
  }),
};
const mockGetAccessToken = jest.fn().mockResolvedValue('accessToken');

beforeEach(() => {
  mockFetch.mockClear();
});

describe('publish()', () => {
  it('should successfully start a publish job', async () => {
    const mockDiagnostics = [
      {
        message: 'This is a log message from PVA',
      },
      {
        message: 'This is a second log message from PVA',
      },
    ];
    mockFetch.mockResolvedValueOnce({
      status: 202,
      json: jest.fn().mockResolvedValue({
        comment: 'testing',
        importedContentEtag: 'W/"version"',
        operationId: 'operationId',
        diagnostics: mockDiagnostics,
        lastUpdateTimeUtc: Date.now(),
        state: 'Validating',
      }),
    });
    const result = await publish(
      mockPublishConfig,
      mockBotProject,
      { comment: 'testing' },
      undefined,
      mockGetAccessToken
    );

    expect(result.status).toBe(202);
    const innerResult = result.result;
    expect(innerResult.message).toBe('Validating bot assets...');
    expect(innerResult.comment).toBe('testing');
    expect(innerResult.eTag).toBe('W/"version"');
    expect(innerResult.log).toEqual(
      mockDiagnostics.map((diag) => `---\n${JSON.stringify(diag, null, 2)}\n---\n`).join('\n')
    );
    expect(innerResult.id).toBe('operationId');
    expect(innerResult.action).toEqual(null);
  });

  it('should surface the status message from PVA if a 202 is not returned', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 502,
      text: jest.fn().mockResolvedValue('Bad Gateway: The service might be down temporarily.'),
    });
    const result = await publish(
      mockPublishConfig,
      mockBotProject,
      { comment: 'testing' },
      undefined,
      mockGetAccessToken
    );

    expect(result.status).toBe(502);
    expect(result.result.message).toBe('Bad Gateway: The service might be down temporarily.');
  });

  it('should surface a 500 and th error message if the publish code throws', async () => {
    mockFetch.mockResolvedValueOnce({
      status: 202,
      json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON at position 0: "<"')),
    });
    const result = await publish(
      mockPublishConfig,
      mockBotProject,
      { comment: 'testing' },
      undefined,
      mockGetAccessToken
    );

    expect(result.status).toBe(500);
    expect(result.result.message).toBe('Invalid JSON at position 0: "<"');
  });
});
