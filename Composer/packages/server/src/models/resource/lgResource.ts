import { ResourceType } from './resource';

import { LGTemplate } from '../bot/interface';
import { LGParser } from 'botbuilder-lg';
import { Diagnostic } from '../validator/interface';
import { FileResource } from './fileResource';

export class LGResource implements FileResource {
  public id: string;
  public content: string;
  public type: ResourceType;
  public diagnostics: Diagnostic[] = [];

  public relativePath: string = '';

  public templates: LGTemplate[] = [];

  constructor(id: string, content: string, relativePath: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.LG;
    this.relativePath = relativePath;
  }

  public index = async () => {
    this.templates = this.parse(this.content, this.id);
  };

  private parse(content: string, id: string): LGTemplate[] {
    const resource = LGParser.parse(content, id);
    const templates = resource.Templates.map(t => {
      return { Name: t.Name, Body: t.Body, Parameters: t.Parameters };
    });
    return templates;
  }
}
