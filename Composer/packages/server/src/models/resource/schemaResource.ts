import { Diagnostic } from '../validator';

import { ResourceType } from './resource';
import { FileResource } from './fileResource';

export class SchemaResource implements FileResource {
  public id: string;
  public content: string;
  public type: ResourceType;
  public diagnostics: Diagnostic[] = [];

  public relativePath: string = '';

  public parseContent: { [key: string]: any } = {};

  constructor(id: string, content: string, relativePath: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.SCHEMA;
    this.relativePath = relativePath;
  }

  public index = async () => {
    try {
      this.parseContent = JSON.parse(this.content);
    } catch (err) {
      throw new Error(`Attempt to parse schema ${this.relativePath} as JSON failed`);
    }
  };
}
