import {
  Expression,
  NumberExpression,
  NumberExpressionConverter,
  StringExpression,
  StringExpressionConverter,
} from 'adaptive-expressions';
import {
  Converter,
  ConverterFactory,
  Dialog,
  DialogConfiguration,
  DialogContext,
  DialogTurnResult,
} from 'botbuilder-dialogs';

/**
 * Configuration for a `MultiplyDialog`.
 */
export interface MultiplyDialogConfiguration extends DialogConfiguration {
  arg1: number | string | Expression | NumberExpression;
  arg2: number | string | Expression | NumberExpression;
  resultProperty: string | Expression | StringExpression;
}

/**
 * Custom command which takes takes 2 data bound arguments (arg1 and arg2) and multiplies them returning that as a databound result.
 */
export class MultiplyDialog extends Dialog implements MultiplyDialogConfiguration {
  public static $kind = 'MultiplyDialog';

  /**
   * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
   * @param dc The `DialogContext` for the current turn of conversation.
   * @param options Optional. Initial information to pass to the dialog.
   * @returns A `Promise` representing the asynchronous operation.
   */
  public beginDialog(dc: DialogContext, options?: {}): Promise<DialogTurnResult> {
    const arg1 = this.arg1.getValue(dc.state);
    const arg2 = this.arg2.getValue(dc.state);

    const result = arg1 * arg2;
    if (this.resultProperty) {
      dc.state.setValue(this.resultProperty.getValue(dc.state), result);
    }

    return dc.endDialog(result);
  }

  /**
   * Gets or sets memory path to bind to arg1 (ex: conversation.width).
   */
  public arg1: NumberExpression;

  /**
   * Gets or sets memory path to bind to arg2 (ex: conversation.height).
   */
  public arg2: NumberExpression;

  /**
   * Gets or sets caller's memory path to store the result of this step in (ex: conversation.area).
   */
  public resultProperty: StringExpression;

  /**
   * Get type converter for each property.
   * @param property Property name.
   */
  public getConverter(property: keyof MultiplyDialogConfiguration): Converter | ConverterFactory {
    switch (property) {
      case 'arg1':
        return new NumberExpressionConverter();
      case 'arg2':
        return new NumberExpressionConverter();
      case 'resultProperty':
        return new StringExpressionConverter();
      default:
        return super.getConverter(property);
    }
  }

  /**
   * @protected
   * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
   * @returns A `string` representing the compute Id.
   */
  protected onComputeId(): string {
    return 'MultiplyDialog';
  }
}
