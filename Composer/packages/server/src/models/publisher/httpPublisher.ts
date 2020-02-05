import { IPublisher, HttpPublisherConfig, PublishResult } from './interface';
import { BotProject } from '../bot/botProject';
import axios from 'axios';

export class HttpPublisher implements IPublisher {
  constructor(config: HttpPublisherConfig) {
    this.id = config.id;
    this.name = config.name;
    this.endpoint = config.endpoint;
    this.baseUrl = this.endpoint + '/composer/api/v1/';
  }

  id: string;
  name: string;
  endpoint: string;
  private baseUrl: string;

  status = async (): Promise<boolean> => {
    try {
      const result = await axios.get(this.baseUrl + 'status');
      console.log(result.data);
      return true;
    } catch (e) {
      return false;
    }
  };

  publish = async (bot: BotProject, version: string): Promise<PublishResult> => {
    throw new Error('Method not implemented.');
  };

  getPublishHistory = async (): Promise<PublishResult[]> => {
    throw new Error('Method not implemented.');
  };

  rollback = async (botID: string, version: string): Promise<PublishResult> => {
    throw new Error('Method not implemented.');
  };
}
