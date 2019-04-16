import { CSharpBotConnector } from './csharpBotConnector';
import { IBotConnector } from './interface';

export class ConnectorFactory {
  public static createConnector(connectorConfig: any): IBotConnector {
    if (connectorConfig.type === 'CSharp') {
      return new CSharpBotConnector(connectorConfig);
    }

    throw new Error('unrecognize connector type');
  }
}
