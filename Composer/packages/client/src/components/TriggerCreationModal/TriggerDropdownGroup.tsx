// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { SDKKinds } from '@bfc/shared';
import { useTriggerConfig } from '@bfc/extension-client';
import formatMessage from 'format-message';

import { dropdownStyles, optionStyles, warningIconStyles } from './styles';
import {
  generateTriggerOptionTree,
  TriggerOptionGroupNode,
  TriggerOptionLeafNode,
  TriggerOptionTreeNode,
} from './TriggerOptionTree';
import { checkRecognizerCompatibility } from './checkRecognizerCompatibility';

export interface TriggerDropwdownGroupProps {
  recognizerType: SDKKinds | undefined;
  triggerType: string;
  setTriggerType: (type: string) => void;
}

export const TriggerDropdownGroup: FC<TriggerDropwdownGroupProps> = ({ recognizerType, setTriggerType }) => {
  const renderDropdownOption = useCallback(
    (option?: IDropdownOption) => {
      if (!option) return null;
      const compatible = checkRecognizerCompatibility(option.key as SDKKinds, recognizerType);
      return (
        <div key={option.text} css={optionStyles}>
          {option.text}
          {!compatible && <Icon iconName={'warning'} style={warningIconStyles} />}
        </div>
      );
    },
    [recognizerType]
  );

  const triggerUISchema = useTriggerConfig();
  const triggerOptionTree = useMemo(() => {
    return generateTriggerOptionTree(
      triggerUISchema,
      formatMessage('What is the type of this trigger?'),
      formatMessage('Select a trigger type')
    );
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

    // Render every group node as a dropdown until meet a leaf node.
    for (let i = 0; i < treePath.length; i++) {
      const currentNode: TriggerOptionTreeNode = treePath[i];
      if (!(currentNode instanceof TriggerOptionGroupNode)) break;

      const nextNode = treePath[i + 1];
      const selectedKey = nextNode ? getKey(nextNode) : '';
      const dropdown = (
        <Dropdown
          key={currentNode.label}
          data-testid={currentNode.label}
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

    return dropdownList;
  };

  const dropdownList = getDropdownList(activeNode);
  return <Stack>{dropdownList}</Stack>;
};
