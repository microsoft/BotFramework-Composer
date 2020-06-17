/// <reference types="react" />
import { WidgetContainerProps, WidgetComponent } from '@bfc/extension';
export interface DialogRefCardProps extends WidgetContainerProps {
  dialog: string | object;
  getRefContent?: (dialogRef: JSX.Element | null) => JSX.Element;
}
export declare const DialogRef: WidgetComponent<DialogRefCardProps>;
//# sourceMappingURL=DialogRef.d.ts.map
