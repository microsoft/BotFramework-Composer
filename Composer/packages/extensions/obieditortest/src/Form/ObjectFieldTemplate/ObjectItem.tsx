import React from 'react';
import { DefaultButton, IContextualMenuItem } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import './styles.scss';

interface ObjectItemProps {
  content: React.ReactNode;
  name: string;
  onDropPropertyClick: (name: string) => (e) => void;
  onEdit: (e) => void;
  schema: {
    __additional_property?: boolean;
  };
}

export default function ObjectItem(props: ObjectItemProps) {
  const { content, schema, onEdit, onDropPropertyClick, name } = props;
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
