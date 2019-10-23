/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { JSONSchema6 } from 'json-schema';
import formatMessage from 'format-message';
import { TextField, IconButton, IContextualMenuItem } from 'office-ui-fabric-react';
import { NeutralColors, FontSizes } from '@uifabric/fluent-theme';
import { IChoice } from 'shared';

import { field, choiceItemContainer, choiceItemValue, choiceItemSynonyms } from '../styles';
import { swap, remove } from '../../../utils';
// import { FormContext } from '../../../types';
import { WidgetLabel } from '../../../widgets/WidgetLabel';
import { EditableField } from '../../EditableField';

interface ChoiceItemProps {
  index: number;
  choice: IChoice;
  hasMoveUp: boolean;
  hasMoveDown: boolean;
  onReorder: (a: number, b: number) => void;
  onDelete: (idx: number) => void;
  onEdit: (idx: number, value?: IChoice) => void;
}

interface ChoicesProps {
  id: string;
  schema: JSONSchema6;
  formData?: IChoice[];
  label: string;
  onChange: (data: IChoice[]) => void;
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
    <div css={choiceItemContainer()} key={key}>
      <div css={choiceItemValue}>
        <EditableField
          onChange={handleEdit('value')}
          value={choice.value}
          styleOverrides={{
            root: { margin: '5px 0 7px 0' },
          }}
          onBlur={handleBlur}
        />
      </div>
      <div css={choiceItemSynonyms}>
        <EditableField
          onChange={handleEdit('synonyms')}
          value={choice.synonyms && choice.synonyms.join(', ')}
          placeholder={formatMessage('Add multiple comma-separated synonyms')}
          styleOverrides={{
            root: { margin: '5px 0 7px 0' },
          }}
          onBlur={handleBlur}
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

export const Choices: React.FC<ChoicesProps> = props => {
  const { onChange, formData = [], id, label } = props;
  const [newChoice, setNewChoice] = useState<IChoice | null>(null);
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
    <React.Fragment>
      <div css={field}>
        <div>
          <WidgetLabel
            label={label}
            description={formatMessage(
              "A list of options to present to the user. Synonyms can be used to allow for variation in a user's response."
            )}
            id={id}
          />
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
            <div css={choiceItemSynonyms}>
              <TextField
                id={`${id}-synonyms`}
                value={newChoice ? (newChoice.synonyms || []).join(', ') : ''}
                onChange={handleNewChoiceEdit('synonyms')}
                placeholder={formatMessage('Add multiple synonyms with comma')}
                autoComplete="off"
              />
            </div>
          </div>
        </div>
      </div>
      <div css={field}>
        {formData &&
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
    </React.Fragment>
  );
};
