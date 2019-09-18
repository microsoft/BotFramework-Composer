import { Resource, ResourceResolver, ResourceType } from '../resource';

import { ResourceValidator } from './resourceValidator';
import { Diagnostic } from './diagnostic';

export class LUValidator implements ResourceValidator {
  public validate = (resource: Resource, _resolver: ResourceResolver): Diagnostic[] => {
    if (resource.type !== ResourceType.LU) {
      throw new Error(`Can't apply LUValidator to resource type ${resource.type}`);
    }
  };
}
