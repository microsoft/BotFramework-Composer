// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';

import { TriggerSubmenuInfo, TriggerUIOptionMap } from './schema/TriggerOption';

class TriggerOptionLeafNode {
  label: string;
  $kind: string;

  constructor(label: string, $kind: string) {
    this.label = label;
    this.$kind = $kind;
  }
}

export class TriggerOptionTree {
  label: string;
  /** Title of a dropdown. 'Which activity type?' */
  prompt?: string;
  /** Placeholder of a dropdown input. 'Select an activity type' */
  placeholder?: string;
  children: (TriggerOptionLeafNode | TriggerOptionTree)[] = [];

  constructor(label: string, prompt?: string, placeholder?: string) {
    this.label = label;
    this.prompt = prompt;
    this.placeholder = placeholder;
  }
}

const getGroupKey = (submenu) => (typeof submenu === 'object' ? submenu.label : submenu || '');

export const generateTriggerOptionTree = (triggerUIOptions: TriggerUIOptionMap): TriggerOptionTree => {
  const root = new TriggerOptionTree(
    '',
    formatMessage('What is the type of this trigger?'),
    formatMessage('Select a trigger type')
  );

  const leafNodeList = Object.entries(triggerUIOptions)
    .filter(([, options]) => !options.submenu)
    .map(([$kind, options]) => new TriggerOptionLeafNode(options.label, $kind));
  root.children.push(...leafNodeList);

  const groups = Object.values(triggerUIOptions)
    .map((options) => options.submenu)
    .filter((submenu) => !!submenu)
    .reduce((result, submenu) => {
      const name = getGroupKey(submenu);
      if (!result[name]) result[name] = new TriggerOptionTree(name, '', '');
      if (typeof submenu === 'object') {
        const tree: TriggerOptionTree = result[name];
        tree.prompt = submenu.prompt;
        tree.placeholder = submenu.placeholder;
      }
      return result;
    }, {} as { [key: string]: TriggerOptionTree });

  Object.entries(triggerUIOptions)
    .filter(([, options]) => options.submenu)
    .forEach(([$kind, options]) => {
      const { label, submenu } = options;
      const node = new TriggerOptionLeafNode(label, $kind);
      const groupName = getGroupKey(submenu);
      groups[groupName].children.push(node);
    });
  root.children.push(...Object.values(groups));
  return root;
};
