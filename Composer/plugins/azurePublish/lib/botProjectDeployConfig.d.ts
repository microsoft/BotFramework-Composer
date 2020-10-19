import { BotProjectRuntimeType } from './botProjectRuntimeType';
export interface BotProjectDeployConfig {
    subId: string;
    creds?: any;
    accessToken: string;
    projPath: string;
    logger: (string: any) => any;
    deployFilePath?: string;
    zipPath?: string;
    publishFolder?: string;
    templatePath?: string;
    dotnetProjectPath?: string;
    generatedFolder?: string;
    remoteBotPath?: string;
    runtimeType?: BotProjectRuntimeType;
    [key: string]: any;
}
