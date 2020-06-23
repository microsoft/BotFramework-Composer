export interface BotSettings {
    feature: BotFeatureSettings;
    blobStorage: BlobStorageConfiguration;
    microsoftAppId: string;
    microsoftAppPassword: string;
    cosmosDb: any;
    applicationInsights: any;
    telemetry: any;
    botDir: string;
}
export interface BotFeatureSettings {
    useShowTypingMiddleware: boolean;
    useInspectionMiddleware: boolean;
    removeRecipientMention: boolean;
}
export interface BlobStorageConfiguration {
    connectionString: string;
    container: string;
}
