import React from 'react';
import { ITextFieldStyles } from 'office-ui-fabric-react/lib/TextField';
import { FieldProps } from '@bfc/extension';
interface EditableFieldProps extends Omit<FieldProps, 'definitions'> {
    fontSize?: string;
    styles?: Partial<ITextFieldStyles>;
    transparentBorder?: boolean;
    ariaLabel?: string;
}
declare const EditableField: React.FC<EditableFieldProps>;
export { EditableField };
//# sourceMappingURL=EditableField.d.ts.map