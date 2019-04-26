import childprocess from 'child_process';

import { BotProjectRef } from '../bot/interface';

import { IBotConnector, BotStatus } from './interface';

export class CSharpBotConnector implements IBotConnector {
  private path: string;

  private child: childprocess.ChildProcess | undefined;
  constructor(pathConfig: any) {
    this.path = pathConfig.path;
  }

  public status: BotStatus = BotStatus.Stopped;

  start = (proj: BotProjectRef) => {
    const realBotPath = proj.path;

    console.log(`command: 'bot build' at ${this.path}`);
    const buildProcess = childprocess.spawnSync('dotnet', [`build`], { cwd: `${this.path}` });

    if (buildProcess.stdout) {
      const stdout = String(buildProcess.stdout);

      if (buildProcess.status !== 0) {
        console.error(stdout);
        throw new Error('unable to build bot project');
      } else {
        console.log(stdout);
      }
    }

    console.log('command: ' + `$dotnet bin/Debug/netcoreapp2.0/BotProject.dll ` + `--bot:path=${realBotPath}`);
    this.child = childprocess.spawn(
      'dotnet',
      [`bin/Debug/netcoreapp2.0/BotProject.dll`, `--bot:path=${realBotPath}`, '--urls', `http://localhost:3979`],
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

    this.status = BotStatus.Running;
    return true;
  };

  stop = () => {
    console.log(`Stopping launcher`);
    if (this.child !== undefined) {
      this.child.kill();
    }
    this.status = BotStatus.Stopped;
    return true;
  };

  inspect = () => {
    return true;
  };
}
