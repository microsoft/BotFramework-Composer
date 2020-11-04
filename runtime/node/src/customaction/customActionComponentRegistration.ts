import { ComponentRegistration } from 'botbuilder';
import { ComponentDeclarativeTypes, DeclarativeType, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { MultiplyDialog } from './multiplyDialog';

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
