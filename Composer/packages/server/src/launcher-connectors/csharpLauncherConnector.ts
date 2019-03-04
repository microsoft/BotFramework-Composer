import {LauncherConnector, LauncherStatus} from './interface';

import process from 'child_process';
import composerConfig  from '../config';

export class CSharpLauncherConnector implements LauncherConnector {

    private path: string;
    private command: string = "dotnet run";
    private child:any = null;

    constructor(config: any) {
        this.path = config.path;
    }

    public status: LauncherStatus = LauncherStatus.Stopped;

    start = () => {
        console.log('__dirname : ' + __dirname)
        const cmd = `cd ${this.path} &&  ${this.command} --bot:provider=${composerConfig.botconfig.bot.provider} --bot:path=${composerConfig.botconfig.bot.path}`;
        console.log("Starting launcher with command " + cmd);

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
    }

    stop = () => {
        console.log(`Stopping launcher`);

        // TODO: this not kill sub-process
        this.child.kill();
        this.status = LauncherStatus.Stopped;
        return true;
    }

    inspect = () => {
        return true;
    }
    
}