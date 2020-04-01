/// <reference types="react" />
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import { MicrosoftInputDialog } from '@bfc/shared';
import { PromptFieldChangeHandler, GetSchema } from './types';
interface PromptSettingsrops extends FieldProps<MicrosoftInputDialog> {
  onChange: PromptFieldChangeHandler;
  getSchema: GetSchema;
}
export declare const PromptSettings: React.FC<PromptSettingsrops>;
export {};
//# sourceMappingURL=PromptSettings.d.ts.map
