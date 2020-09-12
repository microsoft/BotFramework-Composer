/** @jsx jsx */
import { FieldProps, UIOptions } from '@bfc/extension';
import React from 'react';
export interface FormRowProps extends Omit<FieldProps, 'onChange'> {
    onChange: (field: string) => (data: any) => void;
    row: string | [string, string];
}
export declare const getRowProps: (rowProps: FormRowProps, field: string) => {
    id: string;
    schema: import("json-schema").JSONSchema7;
    hidden: boolean;
    label: false | undefined;
    name: string;
    rawErrors: any;
    required: boolean;
    uiOptions: UIOptions;
    value: any;
    onChange: (data: any) => void;
    depth: number;
    definitions: {
        [key: string]: import("json-schema").JSONSchema7Definition;
    } | undefined;
    transparentBorder: boolean | undefined;
    className: string | undefined;
    onBlur: ((id: string, value?: any) => void) | undefined;
    onFocus: ((id: string, value?: any) => void) | undefined;
};
declare const FormRow: React.FC<FormRowProps>;
export { FormRow };
//# sourceMappingURL=FormRow.d.ts.map