import { NumberExpression, StringExpression } from 'adaptive-expressions';
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';

export class MultiplyDialog extends Dialog {
  public beginDialog(dc: DialogContext, options?: {}): Promise<DialogTurnResult> {
    const arg1 = this.arg1.getValue(dc.state);
    const arg2 = this.arg2.getValue(dc.state);

    const result = arg1 * arg2;
    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), result);
    }

    return dc.endDialog(result);
  }

  public arg1: NumberExpression;

  public arg2: NumberExpression;

  public resultProperty: StringExpression;

  public onComputeId(): string {
    return 'MultiplyDialog';
  }
}
