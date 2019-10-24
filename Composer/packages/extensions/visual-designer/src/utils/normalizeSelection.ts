export const normalizeSelection = (selectedIds: string[]): string[] => {
  if (!Array.isArray(selectedIds)) return [];
  // events[0] < events[0].actions[0] < events[1] < events[1].actions[0]
  const ascendingIds = [...selectedIds].sort();

  for (let i = 0; i < ascendingIds.length; i++) {
    const parentId = ascendingIds[i];
    for (let j = i + 1; j < ascendingIds.length; j++) {
      if (ascendingIds[j].startsWith(parentId)) {
        ascendingIds[j] = '';
      }
    }
  }

  return ascendingIds.filter(id => id);
};
