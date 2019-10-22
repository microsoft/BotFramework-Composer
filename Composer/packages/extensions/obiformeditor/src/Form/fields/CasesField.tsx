/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { IContextualMenuItem, IconButton, TextField } from 'office-ui-fabric-react';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { CaseCondition } from 'shared';
import cloneDeep from 'lodash.clonedeep';

import { swap, remove } from '../utils';
import { BFDFieldProps } from '../types';
import { ExpressionWidget } from '../widgets/ExpressionWidget';

import { arrayItem, arrayItemValue, field } from './styles';
import { EditableField } from './EditableField';
interface CaseItemProps {
  index: number;
  value: string;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  onReorder: (a: number, b: number) => void;
  onDelete: (idx: number) => void;
  onEdit: (idx: number, value?: string) => void;
}

const CaseItem: React.FC<CaseItemProps> = props => {
  const { value, hasMoveDown, hasMoveUp, onReorder, onDelete, index, onEdit } = props;
  const [key, setKey] = useState(value);

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
    <div css={[arrayItem, field]}>
      <div css={arrayItemValue}>
        <EditableField key={key} value={value} onChange={handleEdit} onBlur={handleBlur} />
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

export const CasesField: React.FC<BFDFieldProps<CaseCondition[]>> = props => {
  const { id, formData, schema, formContext } = props;
  const [newBranch, setNewBranch] = useState<string>('');

  const handleChange = (_e: any, newValue?: string) => {
    setNewBranch(newValue || '');
  };

  const submitNewBranch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();

      if (newBranch) {
        props.onChange([...props.formData, { value: newBranch }]);
        setNewBranch('');
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
    const casesCopy = cloneDeep(props.formData) || [];
    casesCopy[idx].value = val;
    props.onChange(casesCopy);
  };

  return (
    <div>
      <div css={field}>
        <ExpressionWidget
          label={formatMessage('Branches')}
          id={id}
          value={newBranch}
          onChange={handleChange}
          placeholder={formatMessage('Value')}
          onKeyDown={submitNewBranch}
          schema={schema}
          formContext={formContext}
          rawErrors={[]}
        />
      </div>
      <div>
        {formData.map((v, i) => (
          <CaseItem
            // need to use index + length to account for data changing
            key={`${i}-${formData.length}`}
            value={v.value}
            index={i}
            onReorder={handleReorder}
            onDelete={handleDelete}
            hasMoveDown={i !== props.formData.length - 1}
            hasMoveUp={i !== 0}
            onEdit={handleEdit}
          />
        ))}
        <div css={[arrayItem, field]}>
          <div css={arrayItemValue}>
            <TextField
              styles={{
                root: { margin: '5px 0 7px -9px', cursor: 'default' },
                fieldGroup: {
                  borderColor: 'transparent',
                  transition: 'border-color 0.1s linear',
                  selectors: {
                    ':hover': {
                      borderColor: 'transparent',
                    },
                  },
                },
              }}
              value={formatMessage('Default')}
              onChange={() => {}}
              autoComplete="off"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

CasesField.defaultProps = {
  formData: [],
};
