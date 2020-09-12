import { SDKKinds } from '@bfc/shared';
import { RecognizerSchema, UIOptions } from './formSchema';
import { FlowEditorWidgetMap, FlowWidget } from './flowSchema';
import { MenuOptions } from './menuSchema';
export interface PluginConfig {
    recognizers?: RecognizerSchema[];
    uiSchema?: UISchema;
    flowWidgets?: FlowEditorWidgetMap;
}
export declare type UISchema = {
    [key in SDKKinds]?: {
        flow?: FlowWidget;
        form?: UIOptions;
        menu?: MenuOptions;
    };
};
//# sourceMappingURL=extension.d.ts.map