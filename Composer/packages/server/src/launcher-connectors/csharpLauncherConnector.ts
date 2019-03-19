import { ILauncherConnector } from './interface';
import { LauncherStatus } from './launcherStatus';
import childprocess from 'child_process';
import storage from '../storage/StorageService';

export class CSharpLauncherConnector implements ILauncherConnector {
  private path: string;

  private child: childprocess.ChildProcess | undefined;
  constructor(pathConfig: any) {
    this.path = pathConfig.path;
  }

  public status: LauncherStatus = LauncherStatus.Stopped;

  start = () => {
    console.log('Starting launcher');
    console.log(
      'with command ' +
        `$dotnet bin/Debug/netcoreapp2.0/BotProject.dll` +
        `--bot:path=${storage.getItem<string>('lastActiveBot')}`
    );
    this.child = childprocess.spawn(
      'dotnet',
      [`bin/Debug/netcoreapp2.0/BotProject.dll`, `--bot:path=${storage.getItem<string>('lastActiveBot')}`],
      {
        detached: true,
        cwd: `${this.path}`,
      }
    );

    if (this.child.stdout !== null) {
      this.child.stdout.on('data', (data: any) => {
        console.log(`stdout: ${data}`);
      });
    }

    if (this.child.stderr !== null) {
      this.child.stderr.on('data', (data: any) => {
        console.log(`stderr: ${data}`);
      });
    }

    this.child.on('error', (err: any) => {
      console.log(`stderr: ${err}`);
    });

    this.status = LauncherStatus.Running;
    return true;
  };

  stop = () => {
    console.log(`Stopping launcher`);
    if (this.child !== undefined) {
      this.child.kill();
    }
    this.status = LauncherStatus.Stopped;
    return true;
  };

  inspect = () => {
    return true;
  };
}
