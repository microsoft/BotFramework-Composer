// TODO: create a type for possible publish sources
export function getUserFriendlySource(source?: string): string {
  switch (source) {
    case 'pva':
      return 'PowerVirtualAgents';

    default:
      return 'external service';
  }
}
