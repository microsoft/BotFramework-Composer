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
import { IContextualMenuItem, ContextualMenuItemType, IconButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import classnames from 'classnames';
import { FIELDS_TO_HIDE, OBISchema } from 'shared';

import './styles.css';

interface ObjectItemProps {
  content: React.ReactNode;
  name: string;
  onDropPropertyClick: (name: string) => (e) => void;
  onEdit: (e) => void;
  onAdd: (e) => void;
  schema: OBISchema;
}

export default function ObjectItem(props: ObjectItemProps) {
  const { content, schema, onAdd, onEdit, onDropPropertyClick, name } = props;

  if (name && FIELDS_TO_HIDE.includes(name)) {
    return null;
  }

  const contextItems: IContextualMenuItem[] = [];

  if (schema.__additional_property) {
    contextItems.push({
      key: 'edit',
      text: formatMessage('Edit'),
      iconProps: { iconName: 'Edit' },
      onClick: onEdit,
    });

    contextItems.push({
      key: 'remove',
      text: formatMessage('Remove'),
      iconProps: { iconName: 'Cancel' },
      onClick: onDropPropertyClick(name),
    });

    contextItems.push({
      key: 'divider',
      itemType: ContextualMenuItemType.Divider,
    });

    contextItems.push({
      key: 'new',
      text: formatMessage('New'),
      onClick: onAdd,
    });
  }

  const compoundType = schema.type && typeof schema.type === 'string' && ['array', 'object'].includes(schema.type);

  return (
    <div className={classnames('ObjectItem', { ObjectItemContainer: compoundType })}>
      <div className="ObjectItemField">{content}</div>
      {contextItems.length > 0 && (
        <div className="ObjectItemContext">
          <IconButton
            ariaLabel={formatMessage('Edit Property')}
            menuProps={{ items: contextItems }}
            menuIconProps={{ iconName: 'MoreVertical' }}
            styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
          />
        </div>
      )}
    </div>
  );
}
