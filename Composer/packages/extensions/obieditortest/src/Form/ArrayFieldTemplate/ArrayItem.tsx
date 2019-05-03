import React from 'react';
import { DefaultButton } from 'office-ui-fabric-react';
import { IContextualMenuItem } from 'office-ui-fabric-react';
import { ArrayFieldItem } from 'react-jsonschema-form';

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
        <DefaultButton
          menuProps={{ items: contextItems }}
          ariaLabel="Item Actions"
          data-testid="ArrayItemContextMenu"
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
