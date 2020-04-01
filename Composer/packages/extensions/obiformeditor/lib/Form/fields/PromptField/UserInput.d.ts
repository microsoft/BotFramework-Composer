import React from 'react';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftInputDialog } from '@bfc/shared';
import { GetSchema, PromptFieldChangeHandler } from './types';
interface UserInputProps extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}
export declare const UserInput: React.FC<UserInputProps>;
export {};
//# sourceMappingURL=UserInput.d.ts.map
