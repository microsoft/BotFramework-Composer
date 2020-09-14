import React from 'react';
import { Boundary } from '../models/Boundary';
export interface ElementMeasurerProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    onResize: (boundary: Boundary) => void;
}
/**
 * Notify a ReactNode's size once its size has been changed.
 * Remember to use it inside the focus border component (ElementWrapper).
 */
export declare const ElementMeasurer: React.FC<ElementMeasurerProps>;
//# sourceMappingURL=ElementMeasurer.d.ts.map