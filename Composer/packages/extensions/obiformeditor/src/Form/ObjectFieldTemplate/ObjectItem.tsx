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
