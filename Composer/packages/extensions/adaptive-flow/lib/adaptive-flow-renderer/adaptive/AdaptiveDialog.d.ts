import { FC } from 'react';
import { FlowEditorWidgetMap as NodeWidgetMap } from '@bfc/extension';
import { FlowSchema } from '../types/flowRenderer.types';
import { EditorEventHandler } from '../constants/NodeEventTypes';
import { RendererContextData } from '../contexts/RendererContext';
export interface AdaptiveDialogProps {
  /** Dialog ID */
  dialogId: string;
  /** Dialog JSON */
  dialogData: any;
  /** Current active trigger path such as 'triggers[0]' */
  activeTrigger: string;
  /** Editor event handler */
  onEvent: EditorEventHandler;
  /** UI schema to define how to render a sdk $kind */
  schema: FlowSchema;
  /** All available widgets to render a node */
  widgets: NodeWidgetMap;
  renderers?: Partial<RendererContextData>;
}
export declare const AdaptiveDialog: FC<AdaptiveDialogProps>;
//# sourceMappingURL=AdaptiveDialog.d.ts.map
