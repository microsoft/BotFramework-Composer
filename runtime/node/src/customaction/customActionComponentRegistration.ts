import { ComponentRegistration } from 'botbuilder';
import { ComponentDeclarativeTypes, DeclarativeType, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { MultiplyDialog } from './multiplyDialog';

/**
 * Define component assets for custom actions.
 * A component registration must implement `ComponentDeclarativeTypes` to provide corresponding `DeclarativeType`
 * for each actions.
 */
export class CustomActionComponentRegistration extends ComponentRegistration implements ComponentDeclarativeTypes {
  public getDeclarativeTypes(_resourceExplorer: ResourceExplorer): DeclarativeType<unknown, Record<string, unknown>>[] {
    return [
      {
        kind: MultiplyDialog.$kind,
        type: MultiplyDialog,
      },
    ];
  }
}
