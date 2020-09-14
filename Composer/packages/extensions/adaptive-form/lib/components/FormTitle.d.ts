import React from 'react';
import { UIOptions, JSONSchema7 } from '@bfc/extension';
export declare const styles: {
  container: import('@emotion/utils').SerializedStyles;
  subtitle: import('@emotion/utils').SerializedStyles;
  description: import('@emotion/utils').SerializedStyles;
};
interface FormTitleProps {
  description?: string;
  formData: any;
  id: string;
  onChange: ($designer: object) => void;
  schema: JSONSchema7;
  title?: string;
  uiOptions?: UIOptions;
}
declare const FormTitle: React.FC<FormTitleProps>;
export default FormTitle;
//# sourceMappingURL=FormTitle.d.ts.map
