import { ILuisConfig, IQnAConfig } from '@bfc/shared';
export interface PublishConfig {
    logger: (string: any) => any;
    projPath: string;
    [key: string]: any;
}
export declare class LuisAndQnaPublish {
    private logger;
    private remoteBotPath;
    private generatedFolder;
    private interruptionFolderPath;
    private crossTrainConfig;
    constructor(config: PublishConfig);
    /*******************************************************************************************************************************/
    /**
     * return an array of all the files in a given directory
     * @param dir
     */
    private getFiles;
    /**
     * Helper function to get the appropriate account out of a list of accounts
     * @param accounts
     * @param filter
     */
    private getAccount;
    private notEmptyModel;
    private createGeneratedDir;
    private setCrossTrainConfig;
    private writeCrossTrainFiles;
    private crossTrain;
    private cleanCrossTrain;
    private getInterruptionFiles;
    private publishLuis;
    private buildLuis;
    private buildQna;
    publishLuisAndQna(name: string, environment: string, accessToken: string, language: string, luisSettings: ILuisConfig, qnaSettings: IQnAConfig, luisResource?: string): Promise<{
        luisAppIds: {};
        qnaConfig: any;
    }>;
}
