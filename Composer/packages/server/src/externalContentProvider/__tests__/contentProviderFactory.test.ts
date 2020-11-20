// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExternalContentProviderType } from '@bfc/shared';

import { contentProviderFactory } from '../contentProviderFactory';
import { PowerVirtualAgentsProvider } from '../powerVirtualAgentsProvider';

describe('contentProviderFactory', () => {
  const envBackup = { ...process.env };

  beforeAll(() => {
    Object.assign(process.env, { COMPOSER_TEMP_DIR: 'composer/temp/' });
  });

  afterAll(() => {
    Object.assign(process.env, envBackup);
  });

  it('should get a PVA content provider', () => {
    const providerInfo = {
      kind: 'pva' as ExternalContentProviderType,
      metadata: { baseUrl: '', botId: '', envId: '', name: '', tenantId: '' },
    };
    const provider = contentProviderFactory.getProvider(providerInfo);

    expect(provider instanceof PowerVirtualAgentsProvider);
  });

  it('should return undefined for an unrecognized content source', () => {
    const providerInfo: any = { kind: 'someUnsupportedSource' };
    const provider = contentProviderFactory.getProvider(providerInfo);

    expect(provider).toBeUndefined();
  });
});
