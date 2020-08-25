import { ComponentRegistration, BuilderRegistration, ResourceExplorer } from 'botbuilder-dialogs-declarative';
import { AdaptiveTypeBuilder } from 'botbuilder-dialogs-adaptive';
import { MultiplyDialog } from './multiplyDialog';
import { NumberExpressionConverter, StringExpressionConverter } from 'adaptive-expressions';

export class CustomActionComponentRegistration implements ComponentRegistration {
  private _resourceExplorer: ResourceExplorer;

  public constructor(resourceExplorer: ResourceExplorer) {
    this._resourceExplorer = resourceExplorer;
  }

  public getTypeBuilders(): BuilderRegistration[] {
    return [
      new BuilderRegistration(
        'MultiplyDialog',
        new AdaptiveTypeBuilder(MultiplyDialog, this._resourceExplorer, {
          arg1: new NumberExpressionConverter(),
          arg2: new NumberExpressionConverter(),
          resultProperty: new StringExpressionConverter(),
        })
      ),
    ];
  }
}
