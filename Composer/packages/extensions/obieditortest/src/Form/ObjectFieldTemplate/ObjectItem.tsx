import React from 'react';
import { DefaultButton, IContextualMenuItem, ContextualMenuItemType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import './styles.scss';
import { FIELDS_TO_HIDE } from '../../schema/appschema';

interface ObjectItemProps {
  content: React.ReactNode;
  name: string;
  onDropPropertyClick: (name: string) => (e) => void;
  onEdit: (e) => void;
  onAdd: (e) => void;
  schema: {
    __additional_property?: boolean;
  };
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

  return (
    <div className="ObjectItem">
      <div className="ObjectItemField">{content}</div>
      {contextItems.length > 0 && (
        <div className="ObjectItemContext">
          <DefaultButton ariaLabel={formatMessage('Edit Property')} menuProps={{ items: contextItems }} />
        </div>
      )}
    </div>
  );
}
