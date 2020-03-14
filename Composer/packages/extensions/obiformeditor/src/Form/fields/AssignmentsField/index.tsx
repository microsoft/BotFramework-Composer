// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { NeutralColors, FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { IAssignmentObject, OBISchema, MicrosoftAdaptiveDialog } from '@bfc/shared';
import { FieldProps } from '@bfcomposer/react-jsonschema-form';
import get from 'lodash/get';

import { BFDFieldProps } from '../../types';
import { swap, remove } from '../../utils';
import { TextWidget } from '../../widgets';

import {
  field,
  assignmentField,
  assignmentItem,
  assignmentItemContainer,
  assignmentItemLabel,
  assignmentItemValue,
  assignmentItemValueLabel,
  assignmentItemErrorMessage,
} from './styles';

interface AssignmentItemProps extends FieldProps<MicrosoftAdaptiveDialog> {
  index: number;
  assignment: IAssignmentObject;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  onReorder: (a: number, b: number) => void;
  onDelete: (idx: number) => void;
  onEdit: (idx: number, value?: IAssignmentObject) => void;
}

interface AssignmentItemError {
  property: string | JSX.Element | undefined;
  value: string | JSX.Element | undefined;
}

const AssignmentItem: React.FC<AssignmentItemProps> = props => {
  const {
    assignment,
    index,
    onEdit,
    hasMoveUp,
    hasMoveDown,
    onReorder,
    onDelete,
    schema,
    idSchema,
    uiSchema,
    formContext,
  } = props;
  const [key, setKey] = useState(`${assignment.value}:${assignment.property}`);
  const options = uiSchema['ui:options'];
  const getSchema = (field: keyof IAssignmentObject): OBISchema => {
    return get(schema, ['items', 'properties', field]);
  };
  const contextItems: IContextualMenuItem[] = [
    {
      key: 'moveUp',
      text: 'Move Up',
      iconProps: { iconName: 'CaretSolidUp' },
      disabled: !hasMoveUp,
      onClick: () => onReorder(index, index - 1),
    },
    {
      key: 'moveDown',
      text: 'Move Down',
      iconProps: { iconName: 'CaretSolidDown' },
      disabled: !hasMoveDown,
      onClick: () => onReorder(index, index + 1),
    },
    {
      key: 'remove',
      text: 'Remove',
      iconProps: { iconName: 'Cancel' },
      onClick: () => onDelete(index),
    },
  ];

  const handleEdit = (field: 'value' | 'property') => (val?: string) => {
    onEdit(index, { ...assignment, [field]: val });
  };

  const handleBlur = () => {
    setKey(`${assignment.value}:${assignment.property}`);
    if (!assignment.value && !assignment.property) {
      onDelete(index);
    }
  };

  const [errorMessages, setErrorMessages] = useState<AssignmentItemError>({ property: undefined, value: undefined });

  const handleValidation = (field: 'value' | 'property') => (err?: JSX.Element | string) => {
    setErrorMessages(errorMessages => ({ ...errorMessages, [field]: err }));
  };
  return (
    <div css={[assignmentItemContainer(), assignmentItem]} key={key}>
      <div css={assignmentItemValue}>
        <TextWidget
          onChange={handleEdit('property')}
          value={assignment.property}
          schema={getSchema('property')}
          id={idSchema.property && idSchema.property.__id.replace('assignments_', `assignments_${index}_`)}
          label={formatMessage('Property')}
          formContext={formContext}
          onBlur={handleBlur}
          hiddenErrMessage={true}
          onValidate={handleValidation('property')}
          options={options}
        />
      </div>
      <div css={assignmentItemValue}>
        <TextWidget
          onChange={handleEdit('value')}
          value={assignment.value}
          schema={getSchema('value')}
          id={idSchema.value && idSchema.value.__id.replace('assignments_', `assignments_${index}_`)}
          label={formatMessage('Value')}
          formContext={formContext}
          onBlur={handleBlur}
          hiddenErrMessage={true}
          onValidate={handleValidation('value')}
          options={options}
        />
      </div>
      <div>
        <IconButton
          menuProps={{ items: contextItems }}
          menuIconProps={{ iconName: 'MoreVertical' }}
          ariaLabel={formatMessage('Item Actions')}
          styles={{ menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 } }}
        />
      </div>
      <div css={assignmentItemErrorMessage}>{errorMessages && (errorMessages.property || errorMessages.value)}</div>
    </div>
  );
};

export const AssignmentsField: React.FC<BFDFieldProps> = props => {
  const { formData = [], idSchema, onChange } = props;
  const [newassignment, setNewassignment] = useState<IAssignmentObject>({ property: '', value: '' });
  const [errorMsg, setErrorMsg] = useState<string>('');
  const id = idSchema.__id;

  const handleReorder = (aIdx: number, bIdx: number) => {
    onChange(swap(formData, aIdx, bIdx));
  };

  const handleDelete = (idx: number) => {
    onChange(remove(formData, idx));
  };

  const handleEdit = (idx, val) => {
    const assignments = [...formData];
    assignments[idx] = val;
    onChange(assignments);
  };

  const handleNewassignmentEdit = (field: 'value' | 'property') => (_e: any, data?: string) => {
    setNewassignment({ ...newassignment, [field]: data });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();

      if (newassignment) {
        if (newassignment.value) {
          onChange([...formData, newassignment]);
          setNewassignment({ property: '', value: '' });
          setErrorMsg('');
        } else {
          setErrorMsg(formatMessage('value required'));
        }
      }
    }
  };

  return (
    <div>
      <div css={[assignmentItemContainer('flex-start'), assignmentItemLabel]}>
        <div css={[assignmentItemValue, assignmentItemValueLabel]}>{formatMessage('property')}</div>
        <div css={[assignmentItemValue, assignmentItemValueLabel]}>{formatMessage('value')}</div>
      </div>
      <div css={assignmentField}>
        {Array.isArray(formData) &&
          formData.map((c, i) => (
            <AssignmentItem
              key={`${i}-${formData.length}`}
              assignment={c}
              index={i}
              onEdit={handleEdit}
              onReorder={handleReorder}
              onDelete={handleDelete}
              hasMoveDown={i !== formData.length - 1}
              hasMoveUp={i !== 0}
              {...props}
            />
          ))}
      </div>
      <div css={field}>
        <div css={assignmentItemContainer('flex-start')} onKeyDown={handleKeyDown}>
          <div css={assignmentItemValue}>
            <TextField
              id={`${id}-property`}
              value={newassignment ? newassignment.property : ''}
              onChange={handleNewassignmentEdit('property')}
              placeholder={formatMessage('Property (named location to store information).')}
              autoComplete="off"
              ariaLabel={formatMessage('Property')}
            />
          </div>
          <div css={assignmentItemValue}>
            <TextField
              id={`${id}-value`}
              value={newassignment ? newassignment.value : ''}
              onChange={handleNewassignmentEdit('value')}
              placeholder={formatMessage('New value or expression.')}
              autoComplete="off"
              errorMessage={errorMsg}
              iconProps={{
                iconName: 'ReturnKey',
                style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
              }}
              ariaLabel={formatMessage('Value')}
            />
          </div>
          <div>
            <IconButton
              disabled={true}
              menuIconProps={{ iconName: 'MoreVertical' }}
              ariaLabel={formatMessage('Item Actions')}
              styles={{
                menuIcon: {
                  backgroundColor: NeutralColors.white,
                  color: NeutralColors.gray130,
                  fontSize: FontSizes.size16,
                },
                rootDisabled: {
                  backgroundColor: NeutralColors.white,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
