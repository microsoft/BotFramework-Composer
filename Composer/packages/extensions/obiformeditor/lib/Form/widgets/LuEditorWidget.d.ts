import React from 'react';
import { FormContext } from '../types';
interface LuEditorWidgetProps {
  formContext: FormContext;
  name: string;
  height?: number | string;
  onChange: (template?: string) => void;
}
export declare const LuEditorWidget: React.FC<LuEditorWidgetProps>;
export default LuEditorWidget;
