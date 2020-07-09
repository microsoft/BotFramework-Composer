export interface BotProjectDeployConfig {
  subId: string;
  creds?: any;
  accessToken: string;
  projPath: string;
  logger: (string: any) => any;
  deploymentSettingsPath?: string;
  deployFilePath?: string;
  zipPath?: string;
  publishFolder?: string;
  settingsPath?: string;
  templatePath?: string;
  dotnetProjectPath?: string;
  generatedFolder?: string;
  remoteBotPath?: string;
  [key: string]: any;
}
//# sourceMappingURL=botProjectDeployConfig.d.ts.map
