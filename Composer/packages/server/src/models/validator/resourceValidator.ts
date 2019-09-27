import { Resource, ResourceResolver } from '../resource';

import { Diagnostic } from './diagnostic';

// Validator interface is also resource-based
export interface ResourceValidator {
  validate(resource: Resource, resolver: ResourceResolver): Diagnostic[];
}
