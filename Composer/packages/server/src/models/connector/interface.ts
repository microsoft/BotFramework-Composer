export enum BotStatus {
  NotConnected,
  Connected,
}

export interface IBotConnector {
  status: BotStatus;
  connect(): Promise<void>; // connect to a bot
  sync(config: any): Promise<void>; // sync content with bot
}
