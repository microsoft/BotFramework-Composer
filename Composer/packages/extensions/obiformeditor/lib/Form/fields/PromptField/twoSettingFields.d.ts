import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftInputDialog } from '@bfc/shared';
import { PromptFieldChangeHandler, GetSchema, InputDialogKeys } from './types';
interface TwoSettingFieldsProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
  fields: {
    [key: string]: InputDialogKeys | string;
  }[];
}
export declare const TwoSettingFields: React.FC<TwoSettingFieldsProps>;
export {};
//# sourceMappingURL=twoSettingFields.d.ts.map
