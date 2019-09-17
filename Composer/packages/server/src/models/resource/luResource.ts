import ludown from 'ludown';

import { Diagnostic } from '../validator/interface';

import { ResourceType } from './resource';
import { FileResource } from './fileResource';

export class LUResource implements FileResource {
  public id: string;
  public content: string;
  public type: ResourceType;

  public diagnostics: Diagnostic[] = [];

  public relativePath: string;

  public parsedContent: { [key: string]: any } = {};

  constructor(id: string, content: string, relativePath: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.LU;
    this.relativePath = relativePath;
  }

  public index = async () => {
    this.parsedContent = this.parse(this.content);
  };

  private parse(content: string): Promise<any> {
    const log = false;
    const locale = 'en-us';

    return ludown.parser.parseFile(content, log, locale);
  }

  // TODO: for managed lu
  // support manipulate lu content inside this resource
}
