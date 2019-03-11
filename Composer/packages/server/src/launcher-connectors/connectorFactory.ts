import { CSharpLauncherConnector } from './csharpLauncherConnector';
import { ILauncherConnector } from './interface';

export class ConnectorFactory {
  CreateConnector(connectorConfig: any): ILauncherConnector {
    if (connectorConfig.type === 'CSharp') {
      return new CSharpLauncherConnector(connectorConfig);
    }

    throw new Error('unrecognize connector type');
  }
}
