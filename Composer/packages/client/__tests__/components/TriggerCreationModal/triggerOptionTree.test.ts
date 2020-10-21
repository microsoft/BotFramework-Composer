// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TriggerUISchema } from '@bfc/extension-client';
import { SDKKinds } from '@botframework-composer/types';

import {
  generateTriggerOptionTree,
  TriggerOptionGroupNode,
} from '../../../src/components/TriggerCreationModal/TriggerOptionTree';

const labelAlphabeticalCompareFn = (opt1, opt2) => (opt1.label < opt2.label ? -1 : 1);

describe('generateTriggerOptionTree()', () => {
  it('can generate one layer tree.', () => {
    const simpleTriggerUIOptions: TriggerUISchema = {
      [SDKKinds.OnIntent]: {
        label: '1.OnIntent',
      },
      [SDKKinds.OnInvokeActivity]: {
        label: '2.OnInvokeActivity',
      },
    };
    const tree = generateTriggerOptionTree(
      simpleTriggerUIOptions,
      'Select a trigger',
      'Which trigger?',
      labelAlphabeticalCompareFn
    );

    expect(tree.prompt).toEqual('Select a trigger');
    expect(tree.placeholder).toEqual('Which trigger?');

    expect(tree.parent).toBeNull();
    expect(tree.children.length).toEqual(2);

    expect(tree.children[0].label).toEqual('1.OnIntent');
    expect(tree.children[0].parent).toEqual(tree);

    expect(tree.children[1].label).toEqual('2.OnInvokeActivity');
    expect(tree.children[1].parent).toEqual(tree);
  });

  it('can generate tree with submenu.', () => {
    const advancedTriggerUIOptions: TriggerUISchema = {
      [SDKKinds.OnIntent]: {
        label: '1.OnIntent',
      },
      [SDKKinds.OnTypingActivity]: {
        label: '2.1.OnTypingActivity',
        submenu: {
          label: '2.Activities',
          prompt: 'Select an activity trigger',
          placeholder: 'Which activity?',
        },
      },
      [SDKKinds.OnEventActivity]: {
        label: '2.2OnEventActivity',
        submenu: '2.Activities',
      },
      [SDKKinds.OnInvokeActivity]: {
        label: '2.3OnInvokeActivity',
        submenu: '2.Activities',
      },
    };
    const tree = generateTriggerOptionTree(
      advancedTriggerUIOptions,
      'Select a trigger',
      'Which trigger?',
      labelAlphabeticalCompareFn
    );

    expect(tree.children.length).toEqual(2);

    expect(tree.children[0].label).toEqual('1.OnIntent');
    expect(tree.children[0].parent).toEqual(tree);

    const secondChild = tree.children[1] as TriggerOptionGroupNode;
    expect(secondChild.label).toEqual('2.Activities');
    expect(secondChild.prompt).toEqual('Select an activity trigger');
    expect(secondChild.children.length).toEqual(3);

    expect(secondChild.children[0].label).toEqual('2.1.OnTypingActivity');
    expect(secondChild.children[0].parent).toEqual(secondChild);
  });
});
