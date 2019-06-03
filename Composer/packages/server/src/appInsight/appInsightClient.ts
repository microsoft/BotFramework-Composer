import { azureAppInsight } from './azureAppInsight';
import { localAppInsight } from './localAppInsight';

export const getAppInsightClient = (type: string): IAppInsight => {
  switch (type) {
    case 'local':
      return localAppInsight;
    case 'azure':
      return azureAppInsight;
    default:
      throw new Error('unknown application insight type');
  }
};

export interface IAppInsight {
  trackException(exception: Error): void;
}

export const defaultAppInsightClient = getAppInsightClient('local');
