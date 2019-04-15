import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react';

import './styles.scss';

export default function ObjectItem(props) {
  const { content, schema, onEdit, onDropPropertyClick, name } = props;
  const contextItems = [];

  if (schema.__additional_property) {
    contextItems.push({
      key: 'edit',
      text: 'Edit',
      iconProps: { iconName: 'Edit' },
      onClick: onEdit,
    });

    contextItems.push({
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      onClick: onDropPropertyClick(name),
    });
  }

  return (
    <div className="ObjectItem">
      <div className="ObjectItemField">{content}</div>
      {contextItems.length > 0 && (
        <div className="ObjectItemContext">
          <DefaultButton ariaLabel="Edit Property" menuProps={{ items: contextItems }} />
        </div>
      )}
    </div>
  );
}
