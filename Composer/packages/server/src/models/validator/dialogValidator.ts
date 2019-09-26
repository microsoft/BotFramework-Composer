import { Resource, ResourceResolver, ResourceType, DialogResource } from '../resource';

import { ResourceValidator } from './resourceValidator';
import { Diagnostic } from './diagnostic';
import { VisitorFunc, JsonWalk } from '../../utility/jsonWalk';
import { DialogChecker } from '../bot/dialogChecker';
import { has } from 'lodash';

/**
 * TODO:
 *   1. use schema to verify json structure
 *   2. use schema to verify role like "expression"
 *   3. return the correct location(json path) in each diagonstic
 */
export class DialogValidator implements ResourceValidator {
  public validate = (resource: Resource, _resolver: ResourceResolver): Diagnostic[] => {
    if (resource.type !== ResourceType.DIALOG) {
      throw new Error(`Can't apply DialogValidator to resource type ${resource.type}`);
    }

    let dialog = resource as DialogResource;

    try {
      const errors = this.CheckFields(dialog.content);
      return errors.map(x => new Diagnostic(x, dialog.id));
    } catch (error) {
      return [new Diagnostic(error.message, dialog.id)];
    }
  };

  private CheckFields(dialog: any): string[] {
    const errors: string[] = [];
    const visitor: VisitorFunc = (path: string, value: any): boolean => {
      // it's a valid schema dialog node.
      if (has(value, '$type') && has(DialogChecker, value.$type)) {
        const matchedCheckers = DialogChecker[value.$type];
        matchedCheckers.forEach(checker => {
          const checkRes = checker.apply(null, [
            {
              path,
              value,
            },
          ]);
          if (checkRes) {
            Array.isArray(checkRes) ? errors.push(...checkRes) : errors.push(checkRes);
          }
        });
      }
      return false;
    };

    JsonWalk('$', dialog, visitor);
    return errors;
  }
}
