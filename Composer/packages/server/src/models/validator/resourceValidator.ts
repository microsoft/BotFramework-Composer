import { Resource } from '../resource/resource';
import { ResourceResolver } from '../resource/resourceResolver';

// Validator interface is also resource-based
export interface ResourceValidator {
  validate(resource: Resource, resolver: ResourceResolver): Diagnostic[];
}
