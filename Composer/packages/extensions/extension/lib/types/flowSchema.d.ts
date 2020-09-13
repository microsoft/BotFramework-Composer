import { FC, ComponentClass } from 'react';
import { BaseSchema, SDKKinds } from '@bfc/shared';
export declare type FlowEditorWidgetMap = {
  [widgetName: string]: WidgetComponent<any>;
};
export declare enum FlowSchemaBuiltinKeys {
  default = 'default',
  custom = 'custom',
}
export interface FlowWidget {
  /** Widget implementation (React Class) or Widget name (string) */
  widget: string | WidgetComponent<any>;
  /** If set to true, output widget will be borderless (usually applied to IfCondition, SwitchCondition) */
  nowrap?: boolean;
  [propKey: string]: FlowWidgetProp;
}
export declare type WidgetComponent<T extends WidgetContainerProps> = FC<T> | ComponentClass<T, any>;
export declare type WidgetEventHandler = (eventName: string, eventData?: any) => void;
export interface WidgetContainerProps {
  id: string;
  data: BaseSchema;
  onEvent: WidgetEventHandler;
  [propKey: string]: any;
}
export declare type FlowWidgetProp = Value | PropGenerator | FlowWidget;
declare type Value =
  | string
  | number
  | boolean
  | undefined
  | {
      [key: string]: any;
    };
declare type PropGenerator = (data: any) => string | number | object | JSX.Element;
export declare type FlowUISchema = {
  [key in SDKKinds]?: FlowWidget;
};
export {};
//# sourceMappingURL=flowSchema.d.ts.map
