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
): IContextualMenuItem[] {
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

export function swap<T = any>(arr: T[], a: number, b: number): T[] {
  const newArr = [...arr];
  const tmp = newArr[a];

  newArr[a] = newArr[b];
  newArr[b] = tmp;

  return newArr;
}

export function remove<T = any>(arr: T[], i: number): T[] {
  const newArr = [...arr];
  newArr.splice(i, 1);
  return newArr;
}

export function insertAt<T = any>(arr: T[], item: T, idx: number): T[] {
  const newArr = [...arr];

  if (idx <= 0) {
    newArr.splice(0, 0, item);
  } else {
    newArr.splice(idx, 0, item);
  }

  return newArr;
}

function getOptions(memory: FormMemory, scope: MemoryScope): IDropdownOption[] {
  const options: IDropdownOption[] = [];
  for (const key in memory[scope]) {
    options.push({ key: `${scope}.${key}`, text: `${memory[scope][key]}` });
  }
  return options;
}

function buildScope(memory: FormMemory, scope: MemoryScope): IDropdownOption[] {
  if (!memory || !memory[scope]) return [];

  const options = getOptions(memory, scope);

  if (options.length === 0) return [];

  return [
    { key: scope, text: scope.toUpperCase(), itemType: DropdownMenuItemType.Header },
    ...options,
    { key: `${scope}_divider`, text: '-', itemType: DropdownMenuItemType.Divider },
  ];
}

export function getMemoryOptions(memory: FormMemory): IDropdownOption[] {
  return [
    ...buildScope(memory, MemoryScope.user),
    ...buildScope(memory, MemoryScope.conversation),
    ...buildScope(memory, MemoryScope.dialog),
    ...buildScope(memory, MemoryScope.turn),
  ];
}
