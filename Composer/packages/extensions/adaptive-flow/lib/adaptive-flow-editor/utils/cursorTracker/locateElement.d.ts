import { SelectorElement, Direction } from './type';
/**
 *
 * @param currentElement current element
 * @param elements all elements have AttrNames.SelectableElements attribute
 * @param boundRectKey key to calculate shortest distance
 * @param assistAxle assist axle for calculating.
 * @param filterAttrs filtering elements
 */
export declare function locateNearestElement(currentElement: SelectorElement, elements: SelectorElement[], direction: Direction, filterAttrs?: string[]): SelectorElement;
//# sourceMappingURL=locateElement.d.ts.map