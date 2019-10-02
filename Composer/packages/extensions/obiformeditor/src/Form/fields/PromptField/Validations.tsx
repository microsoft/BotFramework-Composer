/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import { TextField, IconButton, IContextualMenuItem } from 'office-ui-fabric-react';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

import { WidgetLabel } from '../../widgets/WidgetLabel';
import { swap, remove } from '../../utils';

import { validationItem, validationItemValue } from './styles';

interface ValidationItemProps {
  index: number;
  value: string;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  onReorder: (a: number, b: number) => void;
  onDelete: (idx: number) => void;
}

const ValidationItem: React.FC<ValidationItemProps> = props => {
  const { value, hasMoveDown, hasMoveUp, onReorder, onDelete, index } = props;

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
      onClick: fabricMenuItemClickHandler(() => onReorder(index, index - 1)),
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: fabricMenuItemClickHandler(() => onReorder(index, index + 1)),
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      onClick: fabricMenuItemClickHandler(() => onDelete(index)),
    },
  ];

  return (
    <div css={validationItem}>
      <div css={validationItemValue}>{value}</div>
      <IconButton
        menuProps={{ items: contextItems }}
        menuIconProps={{ iconName: 'MoreVertical' }}
        ariaLabel={formatMessage('Item Actions')}
        styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
      />
    </div>
  );
};

interface ValidationsProps {
  onChange: (newData: string[]) => void;
  formData: string[];
  schema: JSONSchema6;
  id: string;
}

export const Validations: React.FC<ValidationsProps> = props => {
  const { schema, id, formData } = props;
  const [newValidation, setNewValidation] = useState<string>('');
  console.log('props', formData);

  const handleChange = (_e: any, newValue?: string) => {
    setNewValidation(newValue || '');
  };

  const submitNewValidation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() === 'enter') {
      console.log('in submit', newValidation);
      e.preventDefault();

      if (newValidation) {
        props.onChange([...props.formData, newValidation]);
        setNewValidation('');
      }
    }
  };

  const handleReorder = (aIdx: number, bIdx: number) => {
    props.onChange(swap(props.formData, aIdx, bIdx));
  };

  const handleDelete = (idx: number) => {
    props.onChange(remove(props.formData, idx));
  };

  return (
    <div>
      <div>
        <WidgetLabel label={formatMessage('Validation Rules')} description={schema.description} id={id} />
        <TextField
          id={id}
          value={newValidation}
          onChange={handleChange}
          placeholder={formatMessage('Add new validation rule here')}
          onKeyDown={submitNewValidation}
        />
      </div>
      <div>
        {formData.map((v, i) => (
          <ValidationItem
            key={`${v}-${i}`}
            value={v}
            index={i}
            onReorder={handleReorder}
            onDelete={handleDelete}
            hasMoveDown={i !== props.formData.length - 1}
            hasMoveUp={i !== 0}
          />
        ))}
      </div>
    </div>
  );
};
