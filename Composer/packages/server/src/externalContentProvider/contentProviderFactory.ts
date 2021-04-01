// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ExternalContentProviderType } from '@botframework-composer/types';

import { ExternalContentProvider, IContentProviderMetadata } from './externalContentProvider';
import { PowerVirtualAgentsProvider, PowerVirtualAgentsMetadata } from './powerVirtualAgentsProvider';
import { AzureBotServiceMetadata, AzureBotServiceProvider } from './azureBotServiceProvider';

type ProviderInfo = PowerVirtualAgentsProviderInfo | AzureBotServiceProviderInfo; // union with additional provider info types (ex. PowerVirtualAgentsProviderInfo | ABSProviderInfo | etc.)

type ProviderInfoBase<T extends IContentProviderMetadata> = {
  kind: ExternalContentProviderType;
  metadata: T;
};

type PowerVirtualAgentsProviderInfo = ProviderInfoBase<PowerVirtualAgentsMetadata> & { kind: 'pva' };
type AzureBotServiceProviderInfo = ProviderInfoBase<AzureBotServiceMetadata> & { kind: 'abs' };

function getProvider(info: ProviderInfo): ExternalContentProvider<IContentProviderMetadata> | undefined {
  switch (info.kind) {
    case 'pva':
      return new PowerVirtualAgentsProvider(info.metadata);
    case 'abs':
      return new AzureBotServiceProvider(info.metadata);
    default:
      return undefined;
  }
}

export const contentProviderFactory = {
  getProvider,
};
