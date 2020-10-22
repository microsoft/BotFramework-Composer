import { ExternalContentProvider, ContentProviderMetadata } from './externalContentProvider';
import { PowerVirtualAgentsProvider, PowerVirtualAgentsMetadata } from './powerVirtualAgentsProvider';
import { ExternalContentProviderType } from './providerType';

type ProviderInfo = PowerVirtualAgentsProviderInfo; // union with additional provider info types (ex. PowerVirtualAgentsProviderInfo | ABSProviderInfo | etc.)

type ProviderInfoBase<T extends ContentProviderMetadata> = {
  type: ExternalContentProviderType;
  metadata: T;
};

type PowerVirtualAgentsProviderInfo = ProviderInfoBase<PowerVirtualAgentsMetadata> & { type: 'pva' };

function getProvider(info: ProviderInfo): ExternalContentProvider<ContentProviderMetadata> | undefined {
  switch (info.type) {
    case 'pva':
      return new PowerVirtualAgentsProvider(info.metadata);

    default:
      return undefined;
  }
}

export const contentProviderFactory = {
  getProvider,
};
