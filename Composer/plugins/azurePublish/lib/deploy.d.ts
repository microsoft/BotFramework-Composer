import { BotProjectDeployConfig } from './botProjectDeployConfig';
export declare class BotProjectDeploy {
    private accessToken;
    private projPath;
    private zipPath;
    private logger;
    private runtime;
    constructor(config: BotProjectDeployConfig);
    /*******************************************************************************************************************************/
    /**
     * Deploy a bot to a location
     */
    deploy(project: any, settings: any, profileName: string, name: string, environment: string, hostname?: string, luisResource?: string): Promise<void>;
    private zipDirectory;
    private deployZip;
}
