import { Resource, ResourceType } from './resource';

export class LUResource implements Resource {
  public id: string;
  public content: string;
  public type: ResourceType;

  constructor(id: string, content: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.LU;
  }
}
