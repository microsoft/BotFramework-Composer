/* eslint react/prop-types:off */
import React from 'react';
import { PrimaryButton, DropdownMenuItemType } from 'office-ui-fabric-react';

import { dialogGroups } from '../../schema/appschema';

import ArrayItem from './ArrayItem';

export default function ObjectArray(props) {
  const { items, canAdd, onAddClick, TitleField, DescriptionField } = props;

  const buildDialogOptions = () => {
    const options = [];

    for (const elem in dialogGroups) {
      options.push({ key: elem, text: elem, itemType: DropdownMenuItemType.Header });
      dialogGroups[elem].forEach(dialog => {
        options.push({
          key: dialog,
          text: dialog,
          onClick: e => {
            onAddClick(e, { $type: dialog });
            return true;
          },
        });
      });
      options.push({ key: `${elem}_divider`, text: '-', itemType: DropdownMenuItemType.Divider });
    }

    return options;
  };

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {items.map((element, idx) => (
        <ArrayItem {...element} key={JSON.stringify(props.formData[props.index]) || idx} />
      ))}
      {canAdd && (
        <PrimaryButton
          type="button"
          onClick={e => {
            onAddClick(e, { $type: 'Microsoft.AdaptiveDialog' });
            return true;
          }}
          split
          menuProps={{ items: buildDialogOptions() }}
          data-testid="ArrayContainerAdd"
        >
          Add
        </PrimaryButton>
      )}
    </div>
  );
}

ObjectArray.defaultProps = {
  formData: [],
  idSchema: {},
  items: [],
  onAddClick: () => {},
};
