import React from 'react';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ArrayFieldTemplateProps } from '@bfdesigner/react-jsonschema-form';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup } from 'shared-menus';

import ArrayItem from './ArrayItem';

const IDialogArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { items, canAdd, onAddClick, TitleField, DescriptionField } = props;

  return (
    <div className="ArrayContainer">
      <TitleField title={props.title} id={`${props.idSchema.__id}__title`} required={props.required} />
      <DescriptionField description={props.schema.description} id={`${props.idSchema.__id}__description`} />
      {items.map((element, idx) => (
        <ArrayItem {...element} key={idx} />
      ))}
      {canAdd && (
        <PrimaryButton
          type="button"
          menuProps={{
            items: createStepMenu(
              [
                DialogGroup.RESPONSE,
                DialogGroup.INPUT,
                DialogGroup.BRANCHING,
                DialogGroup.STEP,
                DialogGroup.MEMORY,
                DialogGroup.CODE,
                DialogGroup.LOG,
              ],
              true,
              onAddClick
            ),
            // items: buildDialogOptions({
            //   filter: item => !item.includes('Rule'),
            //   onClick: (e, item) => onAddClick(e, item.data),
            // }),
            onItemClick: (e, item) => {
              const newItem = item && item.data;

              if (newItem) {
                onAddClick(e, newItem);
              }
            },
          }}
          data-testid="ArrayContainerAdd"
        >
          {formatMessage('Add')}
        </PrimaryButton>
      )}
    </div>
  );
};

IDialogArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default IDialogArray;
