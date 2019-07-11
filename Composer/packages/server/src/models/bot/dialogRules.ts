import { has } from 'lodash';

interface CheckerFunc {
  (node: { path: string; value: any }): string; // error msg, '' for no error
}

function Exist(name: string): CheckerFunc {
  return node => {
    if (has(node.value, name)) return '';
    return `In ${node.path}: "${node.value.$type}" field "${name}" is missing or empty`;
  };
}

/**
 * Dialog Validation Rules
 */
export const DialogRules: { [key: string]: CheckerFunc[] } = {
  'Microsoft.IfCondition': [Exist('condition')],
  'Microsoft.SwitchCondition': [Exist('condition')],
  'Microsoft.SetProperty': [Exist('value')],
  'Microsoft.ForeachPage': [Exist('listProperty')],
  'Microsoft.Foreach': [Exist('listProperty')],
  'Microsoft.EditArray': [
    node => {
      if (has(node.value, 'value') || has(node.value, 'arrayProperty')) return '';
      return `Missing Required field at ${node.path}`;
    },
  ],
  'Microsoft.InputDialog': [],
};
