export enum BotStatus {
  NotConnected,
  Connected,
}

export interface IBotConnector {
  status: BotStatus;
  connect(): Promise<void>; // connect to a bot
  sync(): Promise<void>; // sync content with bot
}
