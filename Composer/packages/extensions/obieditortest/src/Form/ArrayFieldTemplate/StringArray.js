/* eslint react/prop-types:off */
import React from 'react';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';

import './styles.scss';

export function StringItem(props) {
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
    <div className="StringItem">
      <div className="StringItemField">{props.children}</div>
      {contextItems.length > 0 && (
        <div className="StringItemContext">
          <DefaultButton
            menuProps={{ items: contextItems }}
            ariaLabel="Item Actions"
            data-testid="StringItemContextMenu"
          />
        </div>
      )}
    </div>
  );
}

export default function StringArray(props) {
  const { TitleField, DescriptionField } = props;

  return (
    <div className="StringArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {props.items.map((element, idx) => (
        <StringItem {...element} key={JSON.stringify(props.formData[props.index]) || idx} />
      ))}
      {props.canAdd && (
        <PrimaryButton type="button" onClick={props.onAddClick} styles={{ root: { marginTop: '10px' } }}>
          Add
        </PrimaryButton>
      )}
    </div>
  );
}

StringArray.defaultProps = {
  formData: [],
  idSchema: {},
  items: [],
  onAddClick: () => {},
};
