import { ConnectorFactory } from '../launcher-connectors/connectorFactory';
import { ILauncherConnector } from '../launcher-connectors/interface';
import { LauncherStatus } from '../launcher-connectors/launcherStatus';

import settings from './../storage/SettingService';

var connector: ILauncherConnector = new ConnectorFactory().CreateConnector(settings.getItem('launcherConnector'));

export function startServer(): void {
  if (connector.status === LauncherStatus.Running) {
    throw new Error('Already running');
  }

  connector.start();
}

export function stopServer(): void {
  if (connector.status === LauncherStatus.Stopped) {
    throw new Error('Already stopped');
  }

  connector.stop();
}

export function getStatus(): string {
  var status: string = connector.status === LauncherStatus.Running ? 'Running' : 'Stopped';
  return status;
}
