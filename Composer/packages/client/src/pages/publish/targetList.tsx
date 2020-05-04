// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Fragment } from 'react';
import { OverflowSet, IOverflowSetItemProps } from 'office-ui-fabric-react/lib/OverflowSet';

import { overflowSet, targetSelected } from './styles';

export const TargetList = (props) => {
  const onRenderOverflowButton = (overflowItems: any[] | undefined) => {
    return (
      <IconButton
        menuIconProps={{ iconName: 'MoreVertical' }}
        menuProps={{ items: overflowItems! }}
        role="menuitem"
        title="More options"
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
          <div key={index} onClick={() => props.onSelect(target)} style={{ cursor: 'pointer' }}>
            <OverflowSet
              css={props.selectedTarget === target.name ? targetSelected : overflowSet}
              items={[
                {
                  name: target.name,
                  key: target.name,
                },
              ]}
              onRenderItem={onRenderItem}
              onRenderOverflowButton={onRenderOverflowButton}
              overflowItems={[
                {
                  key: 'delete',
                  name: 'Delete',
                  onClick: () => props.onDelete(index, target),
                },
                {
                  key: 'edit',
                  name: 'Edit',
                  onClick: () => props.onEdit(index, target),
                },
              ]}
            />
          </div>
        );
      })}
    </Fragment>
  );
};
