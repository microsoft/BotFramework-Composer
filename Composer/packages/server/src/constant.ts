export const Constant = {
  // storage type
  AzureBlob: 'AzureBlob',
  LocalDrive: 'LocalDrive',

  // field in db
  linkedStorages: 'linkedStorages',
  recentAccessedBots: 'recentAccessedBots',
};
export interface BotConfig {
  files: string[];
  services: string[];
  entry: string;
}
export interface FileInfo {
  name: string;
  content: any;
  path: string;
  dir: string;
}
