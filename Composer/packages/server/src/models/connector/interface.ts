export enum BotStatus {
  NotConnected,
  Connected,
}

export type BotEnvironments = 'production' | 'integration' | 'editing';

export interface IBotConnector {
  status: BotStatus;
  connect(environment: BotEnvironments, hostName: string): Promise<string>; // connect to a bot return the bot endpoint
  sync(config: any): Promise<void>; // sync content with bot
}
