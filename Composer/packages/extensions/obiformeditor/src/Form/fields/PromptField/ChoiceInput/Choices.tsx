// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useState } from 'react';
import { JSONSchema6 } from 'json-schema';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { NeutralColors, FontSizes, SharedColors } from '@uifabric/fluent-theme';
import { IChoice } from '@bfc/shared';

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
import { WidgetLabel } from '../../../widgets/WidgetLabel';

import { StaticChoices } from './StaticChoices';
import { DynamicChoices } from './DynamicChoices';

interface ChoicesProps {
  id: string;
  schema: JSONSchema6;
  formData?: IChoice[];
  label: string;
  onChange: (data: IChoice[]) => void;
}

export const Choices: React.FC<ChoicesProps> = props => {
  const { id, label, onChange, schema } = props;
  const { oneOf: [dynamicSchema] = [] } = schema;
  const [type, setType] = useState<string>('static');

  const handleChange = useCallback(
    (_, { key }) => {
      setType(key as string);
      onChange([]);
    },
    [onChange, setType]
  );

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
      <WidgetLabel
        label={label}
        description={formatMessage(
          "A list of options to present to the user. Synonyms can be used to allow for variation in a user's response."
        )}
        id={id}
      />
      <div css={[choiceItemContainer('flex-start'), choiceItemLabel]}>
        <div css={[choiceItemValue, choiceItemValueLabel]}>{formatMessage('Choice Name')}</div>
        <div css={[choiceItemValue, choiceItemValueLabel]}>{formatMessage('Synonyms (Optional)')}</div>
      </div>
      <div css={choiceField}>
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
    </React.Fragment>
  );
};
