import { Resource, ResourceResolver } from '../resource/interface';

import { ResourceValidator } from './resourceValidator';

// the interface here is design for dialogTracker
// we should import dialog, lu, lg parser here

export class Validator implements ResourceValidator {
  public validate = (resource: Resource, resolver: ResourceResolver) => {
    return [];
  };
}
