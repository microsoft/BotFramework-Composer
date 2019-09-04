import { Resource, ResourceResolver } from '../resource/interface';

import { ResourceValidator } from './interface';

// the interface here is design for dialogTracker
// we should import dialog, lu, lg parser here

export class DeclativeValidator implements ResourceValidator {
  public validate = (resource: Resource, resolver: ResourceResolver) => {
    return [];
  };
}
