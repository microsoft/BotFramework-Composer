// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment } from 'react';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';
import formatMessage from 'format-message';

import { overflowSet, targetSelected } from './styles';

export const TargetList = (props) => {
  const onRenderOverflowButton = (overflowItems: any[] | undefined) => {
    return (
      <IconButton
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: overflowItems! }}
        role="menuitem"
        title={formatMessage('More options')}
      />
    );
  };
  const onRenderItem = (item: IOverflowSetItemProps) => {
    const { name, key } = item;
    return <div key={key}>{name}</div>;
  };

  return (
    <Fragment>
      {props.list.map((target, index) => {
        return (
          <div key={index} style={{ cursor: 'pointer' }} onClick={() => props.onSelect(target)}>
            <OverflowSet
              css={props.selectedTarget === target.name ? targetSelected : overflowSet}
              items={[
                {
                  name: target.name,
                  key: target.name,
                },
              ]}
              overflowItems={[
                {
                  key: 'delete',
                  name: formatMessage('Delete'),
                  onClick: () => props.onDelete(index, target),
                },
                {
                  key: 'edit',
                  name: formatMessage('Edit'),
                  onClick: () => props.onEdit(index, target),
                },
              ]}
              onRenderItem={onRenderItem}
              onRenderOverflowButton={onRenderOverflowButton}
            />
          </div>
        );
      })}
    </Fragment>
  );
};
