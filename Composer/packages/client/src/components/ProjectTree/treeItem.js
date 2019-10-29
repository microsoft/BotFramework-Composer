/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React from 'react';
import { OverflowSet, IconButton, Icon } from 'office-ui-fabric-react';

import { moreButton, overflowSet, moreMenu, navItem, itemText } from './styles';

const onRenderItem = item => {
  return (
    <div css={itemText(item.depth)}>
      {item.depth !== 0 && <Icon iconName="Flow" styles={{ root: { marginRight: '8px' } }} />}
      {item.displayName}
    </div>
  );
};

const onRenderOverflowButton = overflowItems => {
  return (
    <IconButton
      className="dialog-more-btn"
      data-testid="dialogMoreButton"
      styles={moreButton}
      menuIconProps={{ iconName: 'MoreVertical' }}
      menuProps={{ items: overflowItems, styles: { subComponentStyles: { callout: moreMenu } } }}
    />
  );
};

export const TreeItem = props => {
  const { link, isActive, isSubItemActive, depth, onDelete, onSelect } = props;
  return (
    <div
      tabIndex={1}
      css={navItem(isActive, isSubItemActive)}
      onClick={() => {
        onSelect(link.id);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          onSelect(link.id);
        }
      }}
    >
      <OverflowSet
        items={[
          {
            key: link.id,
            depth,
            ...link,
          },
        ]}
        overflowItems={[
          {
            key: 'delete',
            name: 'Delete',
            onClick: () => onDelete(link.id),
          },
        ]}
        css={overflowSet}
        data-testid={`DialogTreeItem${link.id}`}
        onRenderItem={onRenderItem}
        onRenderOverflowButton={link.isRoot ? () => {} : onRenderOverflowButton}
      />
    </div>
  );
};
