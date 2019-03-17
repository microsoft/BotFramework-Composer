import { ILauncherConnector } from './interface';
import { LauncherStatus } from './launcherStatus';
import process from 'child_process';
import { config } from '../config';
import * as request from 'request';

export class CSharpLauncherConnector implements ILauncherConnector {
  private path: string;
  private command: string = 'dotnet run';

  constructor(pathConfig: any) {
    this.path = pathConfig.path;
  }

  public status: LauncherStatus = LauncherStatus.Stopped;

  start = () => {
    const cmd: string = `cd ${this.path} &&  ${this.command} --bot:provider=${config.bot.provider} --bot:path=${
      config.bot.path
    }`;
    console.log('Starting launcher with command ' + cmd);

    process.exec(cmd, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
    });

    this.status = LauncherStatus.Running;
    return true;
  };

  stop = () => {
    console.log(`Stopping launcher`);

    let host: string = 'http://localhost:3979/';
    let endpoint = host + 'api/command';

    request.post(endpoint);

    this.status = LauncherStatus.Stopped;
    return true;
  };

  inspect = () => {
    return true;
  };
}
