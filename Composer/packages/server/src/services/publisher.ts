import { IPublisher, PublishResult } from '../models/publisher/interface';
import { HttpPublisher } from '../models/publisher/httpPublisher';
import { BotProjectService } from './project';

export class PublisherService {
  private publishers: IPublisher[] = [];

  init = () => {
    // TODO: load publisher from config file instead of hard coding here
    this.publishers.push(
      new HttpPublisher({
        id: 'local',
        name: 'Local Bot Manager Service',
        endpoint: 'http://localhost:4000',
      })
    );
  };

  getPublisher = (id: string): IPublisher | undefined => this.publishers.find(p => p.id === id);

  getPublishers = () => this.publishers;

  status = async (id: string): Promise<boolean> => {
    var publisher = this.getPublisher(id);
    if (publisher) {
      return await publisher.status();
    }
    throw new Error(`no such publisher with id ${id}`);
  };

  history = async (id: string): Promise<PublishResult[]> => {
    var publisher = this.getPublisher(id);
    if (publisher) {
      const currentBot = BotProjectService.getCurrentBotProject();
      if (currentBot) {
        return await publisher.history(currentBot.name);
      } else {
        throw new Error('No bot is open to be rollback');
      }
    }
    throw new Error(`no such publisher with id ${id}`);
  };

  publish = async (id: string, version: string): Promise<PublishResult> => {
    const publisher = this.getPublisher(id);
    if (publisher) {
      const currentBot = BotProjectService.getCurrentBotProject();
      if (currentBot) {
        return await publisher.publish(currentBot, version);
      } else {
        throw new Error('No bot is open to be published');
      }
    }
    throw new Error(`no such publisher with id ${id}`);
  };

  rollback = async (id: string, version: string): Promise<PublishResult> => {
    const publisher = this.getPublisher(id);
    if (publisher) {
      const currentBot = BotProjectService.getCurrentBotProject();
      if (currentBot) {
        return await publisher.rollback(currentBot.name, version);
      } else {
        throw new Error('No bot is open to be rollback');
      }
    }
    throw new Error(`no such publisher with id ${id}`);
  };
}

const service = new PublisherService();
service.init();
export default service;
