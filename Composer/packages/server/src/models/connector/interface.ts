import { ILuisConfig } from '../bot/interface';

export enum BotStatus {
  NotConnected,
  Connected,
}

export type BotEnvironments = 'production' | 'integration' | 'editing';

export interface BotConfig {
  MicrosoftAppId: string;
  MicrosoftAppPassword: string;
  luis: ILuisConfig;
  targetEnvironment?: BotEnvironments;
  user?: string;
}

export interface IBotConnector {
  status: BotStatus;
  connect(environment: BotEnvironments, hostName: string): Promise<string>; // connect to a bot return the bot endpoint
  sync(config: BotConfig): Promise<void>; // sync content with bot
}
