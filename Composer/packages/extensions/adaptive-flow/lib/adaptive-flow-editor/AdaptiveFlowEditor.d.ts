import React from 'react';
import { JSONSchema7 } from '@bfc/extension';
export interface VisualDesignerProps {
    onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;
    schema?: JSONSchema7;
}
declare const VisualDesigner: React.FC<VisualDesignerProps>;
export default VisualDesigner;
//# sourceMappingURL=AdaptiveFlowEditor.d.ts.map