import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftInputDialog } from '@bfc/shared';
import { PromptFieldChangeHandler, GetSchema } from './types';
interface OtherProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}
export declare const Other: React.FC<OtherProps>;
export {};
