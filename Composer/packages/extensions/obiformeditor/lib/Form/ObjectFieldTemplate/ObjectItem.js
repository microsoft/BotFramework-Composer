// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { ContextualMenuItemType } from 'office-ui-fabric-react/lib/ContextualMenu';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import classnames from 'classnames';
import { FIELDS_TO_HIDE } from '@bfc/shared';
import './styles.css';
export default function ObjectItem(props) {
  var content = props.content,
    schema = props.schema,
    onAdd = props.onAdd,
    onEdit = props.onEdit,
    onDropPropertyClick = props.onDropPropertyClick,
    name = props.name,
    uiSchema = props.uiSchema;
  var inline = (uiSchema['ui:options'] || {}).inline;
  if (name && FIELDS_TO_HIDE.includes(name)) {
    return null;
  }
  var contextItems = [];
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
  var compoundType = schema.type && typeof schema.type === 'string' && ['array', 'object'].includes(schema.type);
  return React.createElement(
    'div',
    { className: classnames(inline ? 'ObjectItemInline' : 'ObjectItem', { ObjectItemContainer: compoundType }) },
    React.createElement('div', { className: inline ? 'ObjectItemFieldInline' : 'ObjectItemField' }, content),
    contextItems.length > 0 &&
      React.createElement(
        'div',
        { className: 'ObjectItemContext' },
        React.createElement(IconButton, {
          ariaLabel: formatMessage('Edit Property'),
          menuProps: { items: contextItems },
          menuIconProps: { iconName: 'MoreVertical' },
          styles: { menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } },
        })
      )
  );
}
//# sourceMappingURL=ObjectItem.js.map
