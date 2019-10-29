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
import { IconButton } from 'office-ui-fabric-react';
import { IContextualMenuItem } from 'office-ui-fabric-react';
import { ArrayFieldItem } from '@bfcomposer/react-jsonschema-form';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

const ArrayItem: React.FC<ArrayFieldItem> = props => {
  const { hasMoveUp, hasMoveDown, hasRemove, onReorderClick, onDropIndexClick, index } = props;

  // This needs to return true to dismiss the menu after a click.
  const fabricMenuItemClickHandler = fn => e => {
    fn(e);
    return true;
  };

  const contextItems: IContextualMenuItem[] = [
    {
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !hasMoveUp,
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index - 1)),
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index + 1)),
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      disabled: !hasRemove,
      onClick: fabricMenuItemClickHandler(onDropIndexClick(index)),
    },
  ];

  return (
    <div className="ArrayItem">
      <div className="ArrayItemField">{props.children}</div>
      <div className="ArrayItemContext">
        <IconButton
          menuProps={{ items: contextItems }}
          menuIconProps={{ iconName: 'MoreVertical' }}
          ariaLabel={formatMessage('Item Actions')}
          data-testid="ArrayItemContextMenu"
          styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
        />
      </div>
    </div>
  );
};

ArrayItem.defaultProps = {
  onReorderClick: () => () => {},
  onDropIndexClick: () => () => {},
};

export default ArrayItem;
