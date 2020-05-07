import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { ConfirmInput } from '@bfc/shared';
import { PromptFieldChangeHandler, GetSchema } from './types';
interface ConfirmInputSettingsProps extends FieldProps<ConfirmInput> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}
export declare const ConfirmInputSettings: React.FC<ConfirmInputSettingsProps>;
export {};
