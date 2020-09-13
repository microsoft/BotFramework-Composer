import { BaseSchema } from '@bfc/shared';
import { FlowEditorWidgetMap } from '@bfc/extension';
import { FlowWidget, WidgetEventHandler } from '../../types/flowRenderer.types';
import { Boundary } from '../../models/Boundary';
export interface UIWidgetContext {
  /** The uniq id of current schema data. Usually a json path. */
  id: string;
  /** Declarative json with a $kind field. */
  data: BaseSchema;
  /** Handle UI events */
  onEvent: WidgetEventHandler;
  /** Report widget boundary */
  onResize: (boundary: Boundary) => void;
}
export declare const renderUIWidget: (
  widgetSchema: FlowWidget,
  widgetMap: FlowEditorWidgetMap,
  context: UIWidgetContext
) => JSX.Element;
//# sourceMappingURL=widgetRenderer.d.ts.map
