import { Resource, ResourceResolver } from '../resource/interface';

import { ResourceValidator, Diagnostic } from './resourceValidator';
import { ResourceType } from '../resource/resource';

// the interface here is design for dialogTracker
// we should import dialog, lu, lg parser here

export class Validator implements ResourceValidator {
  public validate = (resource: Resource, resolver: ResourceResolver): Diagnostic[] => {
    if (resource.type !== ResourceType.DIALOG) {
      throw new Error(`Can't apply DialogValidator to resource type ${resource.type}`);
    }
  };
}
