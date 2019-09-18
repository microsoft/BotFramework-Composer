import { Resource, ResourceResolver, ResourceType } from '../resource';

import { ResourceValidator } from './resourceValidator';
import { DialogValidator } from './dialogValidator';
import { LGValidator } from './lgValidator';
import { LUValidator } from './luValidator';

/**
 * This is the one single validation library for any declartive assets
 * that can power both command-line tool and composer
 */
export class DeclartiveValidator implements ResourceValidator {
  public validate = (resource: Resource, resolver: ResourceResolver) => {
    let validator: ResourceValidator | null = null;

    // there are definitely simpler way to do this, like store type => class
    // in some map, but i give up on the typescript, will revisit this
    switch (resource.type) {
      case ResourceType.DIALOG:
        validator = new DialogValidator();
        break;
      case ResourceType.LG:
        validator = new LGValidator();
        break;
      case ResourceType.LU:
        validator = new LUValidator();
        break;
    }

    if (validator !== null) {
      return validator.validate(resource, resolver);
    }
    return [];
  };
}
