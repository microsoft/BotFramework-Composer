/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { JSONSchema6 } from 'json-schema';
import { IconButton, IContextualMenuItem } from 'office-ui-fabric-react';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';

import { swap, remove } from '../../utils';
import { ExpressionWidget } from '../../widgets/ExpressionWidget';
import { FormContext } from '../../types';

import { validationItem, validationItemValue, field } from './styles';

interface ValidationItemProps {
  index: number;
  value: string;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  onReorder: (a: number, b: number) => void;
  onDelete: (idx: number) => void;
  formContext: FormContext;
  schema: JSONSchema6;
  onEdit: (idx: number, value?: string) => void;
}

const ValidationItem: React.FC<ValidationItemProps> = props => {
  const { value, hasMoveDown, hasMoveUp, onReorder, onDelete, index, formContext, onEdit, schema } = props;
  const [key, setKey] = useState<string>(value);

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

  const handleEdit = (_e: any, newVal?: string) => {
    onEdit(index, newVal);
  };

  const handleBlur = () => {
    setKey(value);
    if (!value) {
      onDelete(index);
    }
  };

  return (
    <div css={[validationItem, field]}>
      <div css={validationItemValue}>
        <ExpressionWidget
          key={key}
          value={value}
          editable
          formContext={formContext}
          schema={schema}
          onChange={handleEdit}
          onBlur={handleBlur}
        />
      </div>
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
  formContext: FormContext;
}

export const Validations: React.FC<ValidationsProps> = props => {
  const { schema, id, formData, formContext } = props;
  const [newValidation, setNewValidation] = useState<string>('');

  const handleChange = (_e: any, newValue?: string) => {
    setNewValidation(newValue || '');
  };

  const submitNewValidation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() === 'enter') {
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

  const handleEdit = (idx, val) => {
    const validationsCopy = [...props.formData];
    validationsCopy[idx] = val;
    props.onChange(validationsCopy);
  };

  return (
    <div>
      <div css={field}>
        <ExpressionWidget
          label={formatMessage('Validation Rules')}
          id={id}
          value={newValidation}
          onChange={handleChange}
          placeholder={formatMessage('Add new validation rule here')}
          onKeyDown={submitNewValidation}
          schema={schema}
          formContext={formContext}
          rawErrors={[]}
        />
      </div>
      <div>
        {formData.map((v, i) => (
          <ValidationItem
            // need to use index + length to account for data changing
            key={`${i}-${formData.length}`}
            value={v}
            index={i}
            onReorder={handleReorder}
            onDelete={handleDelete}
            hasMoveDown={i !== props.formData.length - 1}
            hasMoveUp={i !== 0}
            onEdit={handleEdit}
            formContext={formContext}
            schema={schema}
          />
        ))}
      </div>
    </div>
  );
};
