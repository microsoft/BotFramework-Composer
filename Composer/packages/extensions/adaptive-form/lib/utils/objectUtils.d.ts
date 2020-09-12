import { ChangeHandler } from '@bfc/extension';
declare type ItemType<ValueType = unknown> = {
    [key: string]: ValueType;
};
declare type ObjectChangeHandler<ValueType = unknown> = (items: ObjectItem<ValueType>[]) => void;
export interface ObjectItem<ValueType = unknown> {
    id: string;
    propertyName: string;
    propertyValue?: ValueType;
}
interface ObjectItemState<ValueType = unknown> {
    objectEntries: ObjectItem<ValueType>[];
    onChange: ObjectChangeHandler<ValueType>;
    addProperty: (name?: string, value?: ValueType) => void;
}
export declare const getPropertyItemProps: <ValueType = unknown>(items: ObjectItem<ValueType>[], index: number, onChange: any) => {
    onChange: (propertyValue: ValueType) => void;
    onDelete: () => void;
    onNameChange: (propertyName: string) => void;
};
export declare function useObjectItems<ValueType = unknown>(items: ItemType<ValueType>, onChange: ChangeHandler<ItemType<ValueType>>): ObjectItemState<ValueType>;
export {};
//# sourceMappingURL=objectUtils.d.ts.map