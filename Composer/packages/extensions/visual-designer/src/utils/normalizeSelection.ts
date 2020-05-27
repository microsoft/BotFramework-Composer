// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const normalizeSelection = (selectedIds: string[]): string[] => {
  if (!Array.isArray(selectedIds)) return [];

  // filter invalid ids such as 'actions[0].diamond'
  const validIds = selectedIds.filter((id) => id.match(/.*\w+\[\d+\]$/));
  // events[0] < events[0].actions[0] < events[1] < events[1].actions[0]
  const ascendingIds = sortActionIds(validIds);

  for (let i = 0; i < ascendingIds.length; i++) {
    const parentId = ascendingIds[i];
    if (!parentId) continue;
    for (let j = i + 1; j < ascendingIds.length; j++) {
      if (ascendingIds[j].startsWith(parentId)) {
        ascendingIds[j] = '';
      }
    }
  }

  return ascendingIds.filter((id) => id);
};

export const sortActionIds = (actionIds: string[]): string[] => {
  const parsedActionIds = actionIds.map((id) => ({
    id,
    paths: id
      .split('.')
      .map((x) => x.replace(/\w+\[(\d+)\]/, '$1'))
      .map((x) => parseInt(x) || 0),
  }));
  const sorted = parsedActionIds.sort((a, b) => {
    const aPaths = a.paths;
    const bPaths = b.paths;

    let diffIndex = 0;
    while (diffIndex < aPaths.length && diffIndex < bPaths.length && aPaths[diffIndex] === bPaths[diffIndex]) {
      diffIndex++;
    }

    const flag = (aPaths[diffIndex] === undefined ? '0' : '1') + (bPaths[diffIndex] === undefined ? '0' : '1');
    switch (flag) {
      case '00':
        // a equal b ('actions[0]', 'actions[0]')
        return 0;
      case '01':
        // a is b's parent, a < b ('actions[0]', 'actions[0].actions[0]')
        return -1;
      case '10':
        // a is b's child, a > b ('actions[0].actions[0]', 'actions[0]')
        return 1;
      case '11':
        return aPaths[diffIndex] - bPaths[diffIndex];
      default:
        return 0;
    }
  });
  return sorted.map((x) => x.id);
};
