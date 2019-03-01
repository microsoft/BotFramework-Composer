import { CSharpLauncherConnector } from './csharpLauncherConnector';
import { LauncherConnector } from './interface';

export class ConnectorFactory {
    CreateConnector(connectorConfig: any): LauncherConnector {

        if (connectorConfig.type == "CSharp") {
            return new CSharpLauncherConnector(connectorConfig);
        }

        throw new Error("unrecognize connector type");
    }
}