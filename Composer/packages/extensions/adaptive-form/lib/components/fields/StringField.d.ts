import React from 'react';
import { FieldProps } from '@bfc/extension';
export declare const borderStyles: (transparentBorder: boolean, error: boolean) => {
    fieldGroup: {
        borderColor: string | undefined;
        transition: string;
        selectors: {
            ':hover': {
                borderColor: string | undefined;
            };
        };
    };
} | {
    fieldGroup?: undefined;
};
export declare const StringField: React.FC<FieldProps<string>>;
//# sourceMappingURL=StringField.d.ts.map