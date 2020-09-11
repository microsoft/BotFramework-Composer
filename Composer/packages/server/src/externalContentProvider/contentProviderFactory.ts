import { ExternalContentProvider, ContentProviderMetadata } from './externalContentProvider';
import { PowerVirtualAgentsProvider } from './powerVirtualAgentsProvider';
import { ExternalContentProviderType } from './providerType';

function getProvider<T extends ContentProviderMetadata>(
  type: ExternalContentProviderType,
  metadata: T
): ExternalContentProvider | undefined {
  switch (type) {
    case 'pva':
      return new PowerVirtualAgentsProvider(metadata);
    default:
      return undefined;
  }
}

export const contentProviderFactory = {
  getProvider,
};
