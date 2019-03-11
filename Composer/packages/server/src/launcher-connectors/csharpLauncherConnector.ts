import { ILauncherConnector } from './interface';
import { LauncherStatus } from './launcherStatus';
import process from 'child_process';
import { config } from '../config';

export class CSharpLauncherConnector implements ILauncherConnector {
  private path: string;
  private command: string = 'dotnet run';
  private child: any = null;

  constructor(pathConfig: any) {
    this.path = pathConfig.path;
  }

  public status: LauncherStatus = LauncherStatus.Stopped;

  start = () => {
    const cmd: string = `cd ${this.path} &&  ${this.command} --bot:provider=${config.bot.provider} --bot:path=${
      config.bot.path
    }`;
    console.log('Starting launcher with command ' + cmd);

    this.child = process.exec(cmd, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });

    this.status = LauncherStatus.Running;
    return true;
  };

  stop = () => {
    console.log(`Stopping launcher`);

    // tODO: this not kill sub-process
    this.child.kill();
    this.status = LauncherStatus.Stopped;
    return true;
  };

  inspect = () => {
    return true;
  };
}
