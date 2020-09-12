import React from 'react';
import { FormErrors, JSONSchema7, UIOptions } from '@bfc/extension';
export interface AdaptiveFormProps {
    errors?: string | FormErrors | string[] | FormErrors[];
    schema?: JSONSchema7;
    formData?: any;
    uiOptions: UIOptions;
    onChange: (value: any) => void;
}
export declare const AdaptiveForm: React.FC<AdaptiveFormProps>;
//# sourceMappingURL=AdaptiveForm.d.ts.map