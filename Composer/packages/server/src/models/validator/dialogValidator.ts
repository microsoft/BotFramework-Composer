import { Resource, ResourceResolver, ResourceType } from '../resource';

import { ResourceValidator } from './resourceValidator';
import { Diagnostic } from './diagnostic';

export class DialogValidator implements ResourceValidator {
  public validate = (resource: Resource, _resolver: ResourceResolver): Diagnostic[] => {
    if (resource.type !== ResourceType.DIALOG) {
      throw new Error(`Can't apply DialogValidator to resource type ${resource.type}`);
    }
  };
}
