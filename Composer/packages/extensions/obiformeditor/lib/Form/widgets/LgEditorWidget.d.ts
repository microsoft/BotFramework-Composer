import React from 'react';
import { FormContext } from '../types';
interface LgEditorWidgetProps {
  formContext: FormContext;
  name: string;
  value?: string;
  height?: number | string;
  onChange: (template?: string) => void;
}
export declare const LgEditorWidget: React.FC<LgEditorWidgetProps>;
export default LgEditorWidget;
//# sourceMappingURL=LgEditorWidget.d.ts.map
