import { ClaimNames } from '../../constants';
import { ILuisConfig } from '../bot/interface';

export enum BotStatus {
  NotConnected,
  Connected,
}

export type BotEnvironments = 'production' | 'integration' | 'editing';

export interface AuthenticatedUser {
  [ClaimNames.name]: string;
  [ClaimNames.upn]: string;
}

export interface BotConfig {
  MicrosoftAppId: string;
  MicrosoftAppPassword: string;
  luis: ILuisConfig;
  targetEnvironment?: BotEnvironments;
  user?: AuthenticatedUser;
}

export interface IPublishVersion {
  buildTimestamp: Date;
  publishTimestamp: Date;
  user: string;
  userEmail: string;
  label: string;
  isInProduction: boolean;
  wasInProduction: boolean;
}

export interface IBotConnector {
  status: BotStatus;
  connect(environment: BotEnvironments, hostName: string): Promise<string>; // connect to a bot return the bot endpoint
  sync(config: BotConfig): Promise<void>; // sync content with bot
  // publishes a build to production, if label is undefined then what is currently in integration is published
  publish(config: BotConfig, label: string): Promise<void>;
  getEditingStatus(): Promise<boolean>; // gets whether the editor has unsaved changes
  getPublishVersions(): Promise<IPublishVersion[]>; // gets a list of saved builds that can be published
}
