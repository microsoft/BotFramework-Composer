import {
  DropdownMenuItemType,
  IContextualMenuItem,
  ContextualMenuItemType,
  IDropdownOption,
} from 'office-ui-fabric-react';

import { dialogGroups } from '../schema/appschema';
import { FormMemory, MemoryScope } from '../types';

export function buildDialogOptions(
  onClick: (newItem: any, e?: any) => void = () => {},
  filter: (elem: string) => boolean = () => true
) {
  const options: IContextualMenuItem[] = [];

  for (const elem in dialogGroups) {
    if (!filter || filter(elem)) {
      options.push({ key: elem, text: elem, itemType: ContextualMenuItemType.Header });
      dialogGroups[elem].forEach(dialog => {
        options.push({
          key: dialog,
          text: dialog,
          onClick: e => {
            onClick({ $type: dialog }, e);
          },
        });
      });
      options.push({ key: `${elem}_divider`, text: '-', itemType: ContextualMenuItemType.Divider });
    }
  }

  return options;
}

export function swap(arr: any[], a: number, b: number) {
  const newArr = [...arr];
  const tmp = newArr[a];

  newArr[a] = newArr[b];
  newArr[b] = tmp;

  return newArr;
}

export function remove(arr: any[], i: number) {
  const newArr = [...arr];
  newArr.splice(i, 1);
  return newArr;
}

function buildScope(memory: FormMemory, scope: MemoryScope) {
  if (!memory || !memory[scope]) return [];

  const options = getOptions(memory, scope);

  if (options.length === 0) return [];

  return [
    { key: scope, text: scope.toUpperCase(), itemType: DropdownMenuItemType.Header },
    ...options,
    { key: `${scope}_divider`, text: '-', itemType: DropdownMenuItemType.Divider },
  ];
}

function getOptions(memory: FormMemory, scope: MemoryScope): IDropdownOption[] {
  const options: IDropdownOption[] = [];
  for (const key in memory[scope]) {
    options.push({ key: `${scope}.${key}`, text: `${memory[scope][key]}` });
  }
  return options;
}

export function getMemoryOptions(memory: FormMemory): IDropdownOption[] {
  return [
    ...buildScope(memory, MemoryScope.user),
    ...buildScope(memory, MemoryScope.conversation),
    ...buildScope(memory, MemoryScope.dialog),
    ...buildScope(memory, MemoryScope.turn),
  ];
}
