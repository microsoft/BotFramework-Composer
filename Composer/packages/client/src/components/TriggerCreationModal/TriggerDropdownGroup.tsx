// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC, ReactNode, useMemo, useState } from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { SDKKinds } from '@bfc/shared';

import { dropdownStyles } from './styles';
import { checkTriggerOptions, getTriggerOptions } from './getDropdownOptions';
import { renderDropdownOption } from './TriggerCreationModal';
import {
  generateTriggerOptionTree,
  TriggerOptionGroupNode,
  TriggerOptionLeafNode,
  TriggerOptionTreeNode,
} from './TriggerOptionTree';
import { builtinTriggerUISchema } from './schema/builtinSchema';

export interface TriggerDropwdownGroupProps {
  recognizerType: SDKKinds | undefined;
  triggerType: string;
  setTriggerType: (type: string) => void;
}

export const TriggerDropdownGroup: FC<TriggerDropwdownGroupProps> = ({ recognizerType, setTriggerType }) => {
  const triggerTypeOptions: IDropdownOption[] = getTriggerOptions();

  // Mark out incompatible triggers of current recognizer
  checkTriggerOptions(triggerTypeOptions, recognizerType);

  const triggerOptionTree = useMemo(() => {
    return generateTriggerOptionTree(builtinTriggerUISchema);
  }, []);
  const [activeNode, setActiveNode] = useState<TriggerOptionTreeNode>(triggerOptionTree);
  const onClickNode = (node: TriggerOptionTreeNode) => {
    setActiveNode(node);
    if (node instanceof TriggerOptionLeafNode) {
      setTriggerType(node.$kind);
    } else {
      setTriggerType('');
    }
  };

  const getDropdownList = (activeNode: TriggerOptionTreeNode) => {
    const treePath: TriggerOptionTreeNode[] = [activeNode];
    while (treePath[0].parent) {
      treePath.unshift(treePath[0].parent);
    }

    const dropdownList: ReactNode[] = [];

    const getKey = (x: TriggerOptionTreeNode) => (x instanceof TriggerOptionLeafNode ? x.$kind : x.label);

    for (let i = 0; i < treePath.length; i++) {
      const currentNode: TriggerOptionTreeNode = treePath[i];
      if (currentNode instanceof TriggerOptionGroupNode) {
        const nextNode = treePath[i + 1];
        const selectedKey = nextNode ? getKey(nextNode) : '';
        const dropdown = (
          <Dropdown
            label={currentNode.prompt}
            options={currentNode.children.map((x) => {
              return {
                key: getKey(x),
                text: x.label,
                node: x,
              };
            })}
            placeholder={currentNode.placeholder}
            selectedKey={selectedKey}
            styles={dropdownStyles}
            onChange={(e, opt: any) => {
              onClickNode(opt.node);
            }}
            onRenderOption={renderDropdownOption}
          />
        );
        dropdownList.push(dropdown);
      }
    }

    return dropdownList;
  };

  const dropdownList = getDropdownList(activeNode);
  return <Stack>{...dropdownList}</Stack>;
};
