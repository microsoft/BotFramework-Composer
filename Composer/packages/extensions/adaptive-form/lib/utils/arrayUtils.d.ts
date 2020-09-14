import { ChangeHandler } from '@bfc/extension';
declare type ArrayChangeHandler<ItemType> = (items: ArrayItem<ItemType>[]) => void;
export interface ArrayItem<ItemType = unknown> {
    id: string;
    value: ItemType;
}
interface ArrayItemState<ItemType> {
    arrayItems: ArrayItem<ItemType>[];
    handleChange: ArrayChangeHandler<ItemType>;
    addItem: (newItem: ItemType) => void;
}
export declare const getArrayItemProps: <ItemType = unknown>(items: ArrayItem<ItemType>[], index: number, onChange: ArrayChangeHandler<ItemType>) => {
    canRemove: boolean;
    canMoveDown: boolean;
    canMoveUp: boolean;
    index: number;
    onChange: (newValue: ItemType) => void;
    onReorder: (aIdx: number) => void;
    onRemove: () => void;
};
export declare function useArrayItems<ItemType = unknown>(items: ItemType[], onChange: ChangeHandler<ItemType[]>): ArrayItemState<ItemType>;
export {};
//# sourceMappingURL=arrayUtils.d.ts.map