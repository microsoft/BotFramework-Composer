import React from 'react';
import { ShellData, ShellApi } from '@bfc/shared';
import { FormMemory } from './types';
export interface FormEditorProps extends ShellData {
  memory?: FormMemory;
  onBlur?: () => void;
  onChange: (newData: object, updatePath?: string) => void;
  shellApi: ShellApi;
}
export declare const FormEditor: React.FunctionComponent<FormEditorProps>;
export default FormEditor;
