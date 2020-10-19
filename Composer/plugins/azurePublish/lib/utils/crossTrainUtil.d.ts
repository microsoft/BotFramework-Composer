import { LuFile, DialogInfo, FileInfo } from '@bfc/shared';
export declare function getReferredLuFiles(luFiles: LuFile[], dialogs: DialogInfo[], checkContent?: boolean): LuFile[];
export interface ICrossTrainConfig {
    rootIds: string[];
    triggerRules: {
        [key: string]: any;
    };
    intentName: string;
    verbose: boolean;
    botName: string;
}
export declare function createCrossTrainConfig(dialogs: any[], luFilesInfo: FileInfo[], luFeatures?: {}): ICrossTrainConfig;
