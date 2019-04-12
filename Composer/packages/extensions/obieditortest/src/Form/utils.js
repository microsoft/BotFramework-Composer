import { DropdownMenuItemType } from 'office-ui-fabric-react';

import { dialogGroups } from '../schema/appschema';

export function buildDialogOptions(onClick = () => {}, filter = () => true) {
  const options = [];

  for (const elem in dialogGroups) {
    if (!filter || filter(elem)) {
      options.push({ key: elem, text: elem, itemType: DropdownMenuItemType.Header });
      dialogGroups[elem].forEach(dialog => {
        options.push({
          key: dialog,
          text: dialog,
          onClick: () => {
            onClick({ $type: dialog });
            return true;
          },
        });
      });
      options.push({ key: `${elem}_divider`, text: '-', itemType: DropdownMenuItemType.Divider });
    }
  }

  return options;
}

export function swap(arr, a, b) {
  const newArr = [...arr];
  const tmp = newArr[a];

  newArr[a] = newArr[b];
  newArr[b] = tmp;

  return newArr;
}

export function remove(arr, i) {
  const newArr = [...arr];
  newArr.splice(i, 1);
  return newArr;
}
