/* eslint react/prop-types:off */
import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react';

export default function ArrayItem(props) {
  const { hasMoveUp, hasMoveDown, hasRemove, onReorderClick, onDropIndexClick, index } = props;
  const contextItems = [];

  // This needs to return true to dismiss the menu after a click.
  const fabricMenuItemClickHandler = fn => e => {
    fn(e);
    return true;
  };

  if (hasMoveUp) {
    contextItems.push({
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index - 1)),
    });
  }

  if (hasMoveDown) {
    contextItems.push({
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      onClick: fabricMenuItemClickHandler(onReorderClick(index, index + 1)),
    });
  }

  if (hasRemove) {
    contextItems.push({
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      onClick: fabricMenuItemClickHandler(onDropIndexClick(index)),
    });
  }

  return (
    <div className="ArrayItem">
      <div className="ArrayItemField">{props.children}</div>
      {contextItems.length > 0 && (
        <div className="ArrayItemContext">
          <DefaultButton
            menuProps={{ items: contextItems }}
            ariaLabel="Item Actions"
            data-testid="ArrayItemContextMenu"
          />
        </div>
      )}
    </div>
  );
}
