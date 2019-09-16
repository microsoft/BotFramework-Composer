import { Resource, ResourceType } from './resource';
import { LGTemplate } from '../bot/interface';
import { LGParser } from 'botbuilder-lg';
import { Diagnostic } from '../validator/interface';

export class LGResource implements Resource {
  public id: string;
  public content: string;
  public type: ResourceType;
  public diagnostics: Diagnostic[] = [];

  public templates: LGTemplate[] = [];

  constructor(id: string, content: string) {
    this.id = id;
    this.content = content;
    this.type = ResourceType.LG;
    this.templates = this.parse(this.content, this.id);
  }

  private parse(content: string, id: string): LGTemplate[] {
    const resource = LGParser.parse(content, id);
    const templates = resource.Templates.map(t => {
      return { Name: t.Name, Body: t.Body, Parameters: t.Parameters };
    });
    return templates;
  }
}
