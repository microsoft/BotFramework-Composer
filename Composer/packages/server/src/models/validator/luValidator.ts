import ludown from 'ludown';

import { Resource, ResourceResolver, ResourceType } from '../resource';

import { ResourceValidator } from './resourceValidator';
import { Diagnostic } from './diagnostic';

export class LUValidator implements ResourceValidator {
  public validate = (resource: Resource, _resolver: ResourceResolver): Diagnostic[] => {
    if (resource.type !== ResourceType.LU) {
      throw new Error(`Can't apply LUValidator to resource type ${resource.type}`);
    }

    let diagnostics: Diagnostic[] = [];

    try {
      this.parse(resource.content);
    } catch (err) {
      diagnostics.push(new Diagnostic(err.message, resource.id));
    }

    return diagnostics;
  };

  private parse(content: string): any {
    const log = false;
    const locale = 'en-us';

    return ludown.parser.parseFile(content, log, locale);
  }
}
