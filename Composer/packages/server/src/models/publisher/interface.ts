import { BotProject } from '../bot/botProject';

export interface IPublisher {
  id: string;
  name: string;
  status(): Promise<boolean>;
  publish(bot: BotProject, version: string): Promise<PublishResult>;
  getPublishHistory(): Promise<PublishResult[]>;
  rollback(botID: string, version: string): Promise<PublishResult>;
}

export interface PublishResult {
  botID: string;
  version: string;
  message?: string; // a text message that can be presented in composer
}

export interface HttpPublisherConfig {
  id: string;
  name: string;
  endpoint: string;
  // TODO: add more config to allow further costumization
}
