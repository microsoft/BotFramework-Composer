import { Resource, ResourceType } from './resource';
import { LGTemplate } from 'botbuilder-lg';

export class LGResource implements Resource {
  public id: string;
  public content: string;
  public type: ResourceType;

  public templates: LGTemplate[];

  constructor(id: string, content: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.LG;
  }
}
