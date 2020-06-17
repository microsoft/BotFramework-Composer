import { BaseSchema } from '@bfc/shared';
import { FlowWidget, FlowEditorWidgetMap, WidgetEventHandler } from '@bfc/extension';
import { Boundary } from '../models/Boundary';
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
//# sourceMappingURL=flowSchemaRenderer.d.ts.map
