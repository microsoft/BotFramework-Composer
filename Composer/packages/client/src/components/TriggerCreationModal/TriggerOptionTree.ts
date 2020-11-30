// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TriggerUISchema } from '@bfc/extension-client';

import { TriggerUIOption } from './schema/TriggerOption';

export class TriggerOptionLeafNode {
  label: string;
  $kind: string;
  parent: TriggerOptionGroupNode | null = null;

  constructor(label: string, $kind: string) {
    this.label = label;
    this.$kind = $kind;
  }
}

export class TriggerOptionGroupNode {
  label: string;
  /** Title of a dropdown. 'Which activity type?' */
  prompt?: string;
  /** Placeholder of a dropdown input. 'Select an activity type' */
  placeholder?: string;
  children: (TriggerOptionLeafNode | TriggerOptionGroupNode)[] = [];
  parent: TriggerOptionGroupNode | null = null;

  constructor(label: string, prompt?: string, placeholder?: string) {
    this.label = label;
    this.prompt = prompt;
    this.placeholder = placeholder;
  }
}

export type TriggerOptionTree = TriggerOptionGroupNode;

export type TriggerOptionTreeNode = TriggerOptionGroupNode | TriggerOptionLeafNode;

const getGroupKey = (submenu) => (typeof submenu === 'object' ? submenu.label : submenu || '');

export const generateTriggerOptionTree = (
  triggerUIOptions: TriggerUISchema,
  rootPrompt: string,
  rootPlaceHolder: string,
  optionCompareFn?: (a: TriggerOptionTreeNode, b: TriggerOptionTreeNode) => number
): TriggerOptionTree => {
  const root = new TriggerOptionGroupNode('triggerTypeDropDown', rootPrompt, rootPlaceHolder);

  const leafNodeList = Object.entries(triggerUIOptions)
    .filter(([, options]) => options && !options.submenu)
    .map(([$kind, options]) => new TriggerOptionLeafNode(options?.label ?? '', $kind));
  root.children.push(...leafNodeList);
  leafNodeList.forEach((leaf) => (leaf.parent = root));

  const groups = Object.values(triggerUIOptions)
    .map((options) => options && options.submenu)
    .filter(Boolean)
    .reduce((result, submenu) => {
      const name = getGroupKey(submenu);
      if (!result[name]) result[name] = new TriggerOptionGroupNode(name, '', '');
      if (typeof submenu === 'object') {
        const tree: TriggerOptionGroupNode = result[name];
        tree.prompt = submenu.prompt;
        tree.placeholder = submenu.placeholder;
        tree.parent = root;
      }
      return result;
    }, {} as { [key: string]: TriggerOptionGroupNode });

  Object.entries(triggerUIOptions)
    .filter(([, options]) => options && options.submenu)
    .forEach(([$kind, options]) => {
      const { label, submenu } = options as TriggerUIOption;
      const node = new TriggerOptionLeafNode(label, $kind);
      const groupName = getGroupKey(submenu);
      const groupParent = groups[groupName];
      groupParent.children.push(node);
      node.parent = groupParent;
    });
  root.children.push(...Object.values(groups));

  // sort tree nodes
  if (optionCompareFn) {
    root.children.sort(optionCompareFn);
    Object.values(groups).forEach((x) => x.children.sort(optionCompareFn));
  }

  return root;
};
