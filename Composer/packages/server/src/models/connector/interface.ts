import { LocationRef } from '../bot/interface';

export enum BotStatus {
  Running,
  Stopped,
}

export interface IBotConnector {
  status: BotStatus;
  start(proj: LocationRef): boolean; // maybe start should return address
  stop(): boolean;
  inspect(): any;
}
