import { ResourceType } from './resource';
import { FileResource } from './fileResource';
import { Diagnostic } from '../validator/interface';

export class LUResource implements FileResource {
  public id: string;
  public content: string;
  public type: ResourceType;

  public diagnostics: Diagnostic[] = [];

  public relativePath: string;

  constructor(id: string, content: string, relativePath: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.LU;
    this.relativePath = relativePath;
  }

  public index = async () => {
    //
  };
}
