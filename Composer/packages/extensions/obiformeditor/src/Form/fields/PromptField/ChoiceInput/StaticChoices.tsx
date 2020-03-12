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
import { IChoiceObject } from '@bfc/shared';

import {
  field,
  choiceField,
  choiceItem,
  choiceItemContainer,
  choiceItemLabel,
  choiceItemValue,
  choiceItemValueLabel,
} from '../styles';
import { swap, remove } from '../../../utils';
import { EditableField } from '../../EditableField';

interface ChoiceItemProps {
  index: number;
  choice: IChoiceObject;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  onReorder: (a: number, b: number) => void;
  onDelete: (idx: number) => void;
  onEdit: (idx: number, value?: IChoiceObject) => void;
}

const ChoiceItem: React.FC<ChoiceItemProps> = props => {
  const { choice, index, onEdit, hasMoveUp, hasMoveDown, onReorder, onDelete } = props;
  const [key, setKey] = useState(`${choice.value}:${choice.synonyms ? choice.synonyms.join() : ''}`);

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

  const handleEdit = (field: 'value' | 'synonyms') => (_e: any, val?: string) => {
    if (field === 'synonyms') {
      onEdit(index, { ...choice, synonyms: val ? val.split(', ') : [] });
    } else {
      onEdit(index, { ...choice, value: val });
    }
  };

  const handleBlur = () => {
    setKey(`${choice.value}:${choice.synonyms ? choice.synonyms.join() : ''}`);
    if (!choice.value && (!choice.synonyms || !choice.synonyms.length)) {
      onDelete(index);
    }
  };

  return (
    <div css={[choiceItemContainer(), choiceItem]} key={key}>
      <div css={choiceItemValue}>
        <EditableField
          onChange={handleEdit('value')}
          value={choice.value}
          styles={{
            root: { margin: '7px 0 7px 0' },
          }}
          onBlur={handleBlur}
          ariaLabel={formatMessage('Value')}
        />
      </div>
      <div css={choiceItemValue}>
        <EditableField
          onChange={handleEdit('synonyms')}
          value={choice.synonyms && choice.synonyms.join(', ')}
          placeholder={formatMessage('Add multiple comma-separated synonyms')}
          styles={{
            root: { margin: '7px 0 7px 0' },
          }}
          options={{ transparentBorder: true }}
          onBlur={handleBlur}
          ariaLabel={formatMessage('Synonyms')}
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
    </div>
  );
};

export const StaticChoices = props => {
  const { formData = [], id, onChange } = props;
  const [newChoice, setNewChoice] = useState<IChoiceObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleReorder = (aIdx: number, bIdx: number) => {
    onChange(swap(formData, aIdx, bIdx));
  };

  const handleDelete = (idx: number) => {
    onChange(remove(formData, idx));
  };

  const handleEdit = (idx, val) => {
    const choices = [...(formData || [])];
    choices[idx] = val;
    onChange(choices);
  };

  const handleNewChoiceEdit = (field: 'value' | 'synonyms') => (_e: any, data?: string) => {
    if (field === 'synonyms') {
      setNewChoice({ ...newChoice, synonyms: data ? data.split(', ') : [] });
    } else {
      setNewChoice({ ...newChoice, value: data });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key.toLowerCase() === 'enter') {
      e.preventDefault();

      if (newChoice) {
        if (newChoice.value) {
          onChange([...formData, newChoice]);
          setNewChoice(null);
          setErrorMsg('');
        } else {
          setErrorMsg(formatMessage('value required'));
        }
      }
    }
  };

  return (
    <div>
      <div css={[choiceItemContainer('flex-start'), choiceItemLabel]}>
        <div css={[choiceItemValue, choiceItemValueLabel]}>{formatMessage('Choice Name')}</div>
        <div css={[choiceItemValue, choiceItemValueLabel]}>{formatMessage('Synonyms (Optional)')}</div>
      </div>
      <div css={choiceField}>
        {Array.isArray(formData) &&
          formData.map((c, i) => (
            <ChoiceItem
              key={`${i}-${formData.length}`}
              choice={c}
              index={i}
              onEdit={handleEdit}
              onReorder={handleReorder}
              onDelete={handleDelete}
              hasMoveDown={i !== formData.length - 1}
              hasMoveUp={i !== 0}
            />
          ))}
      </div>
      <div css={field}>
        <div css={choiceItemContainer('flex-start')} onKeyDown={handleKeyDown}>
          <div css={choiceItemValue}>
            <TextField
              id={id}
              value={newChoice ? newChoice.value : ''}
              onChange={handleNewChoiceEdit('value')}
              placeholder={formatMessage('Add new option here')}
              autoComplete="off"
              errorMessage={errorMsg}
            />
          </div>
          <div css={choiceItemValue}>
            <TextField
              id={`${id}-synonyms`}
              value={newChoice ? (newChoice.synonyms || []).join(', ') : ''}
              onChange={handleNewChoiceEdit('synonyms')}
              placeholder={formatMessage('Add multiple comma-separated synonyms ')}
              autoComplete="off"
              iconProps={{
                iconName: 'ReturnKey',
                style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
              }}
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
