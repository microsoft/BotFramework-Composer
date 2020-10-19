import { ILuisConfig } from '@bfc/shared';
export interface LuisPublishConfig {
    logger: (string: any) => any;
    [key: string]: any;
}
export declare class LuisPublish {
    private logger;
    constructor(config: LuisPublishConfig);
    /*******************************************************************************************************************************/
    /**
     * return an array of all the files in a given directory
     * @param dir
     */
    private getFiles;
    private notEmptyLuisModel;
    /**
     * Helper function to get the appropriate account out of a list of accounts
     * @param accounts
     * @param filter
     */
    private getAccount;
    publishLuis(workingFolder: string, name: string, environment: string, accessToken: string, language: string, luisSettings: ILuisConfig, luisResource?: string): Promise<any>;
}
