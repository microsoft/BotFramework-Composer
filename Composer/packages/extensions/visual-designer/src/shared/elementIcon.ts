import { getDialogGroupByType } from 'shared-menus';

export function getElementIcon($type): string {
  const dialgGroup = getDialogGroupByType($type) as string;
  return dialgGroup === 'INPUT' ? 'User' : 'MessageBot';
}
