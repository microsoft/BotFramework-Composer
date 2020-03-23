// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { Dropdown, ResponsiveMode, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { SDKTypes } from '@bfc/shared';
import { DialogInfo } from '@bfc/indexers';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';
import { LuEditorWidget } from './LuEditorWidget';
import { RegexEditorWidget } from './RegexEditorWidget';

const EMPTY_OPTION = { key: '', text: '' };

function recognizerType({ triggers }: DialogInfo, id: string): string | undefined {
  const triggerId = id.substring(id.indexOf('#.') + 2, id.indexOf(']_') + 1);
  return triggers.find(trigger => trigger.id === triggerId)?.recognizerType;
}

export const IntentWidget: React.FC<BFDWidgetProps> = props => {
  const { disabled, onChange, id, onFocus, onBlur, value, formContext, placeholder, label, schema } = props;
  const { description } = schema;
  const { currentDialog } = formContext;

  let options: IDropdownOption[] = [];
  const type = recognizerType(currentDialog, id);
  switch (type) {
    case SDKTypes.RegexRecognizer:
    case SDKTypes.LuisRecognizer:
      break;
    default:
      options = [EMPTY_OPTION];
      break;
  }

  const handleChange = (_e, option): void => {
    if (option) {
      onChange(option.key);
    }
  };

  return (
    <>
      {type === SDKTypes.ValueRecognizer && (
        <>
          <WidgetLabel label={label} description={description} id={id} />
          <Dropdown
            id={id.replace(/\.|#/g, '')}
            onBlur={() => onBlur && onBlur(id, value)}
            onChange={handleChange}
            onFocus={() => onFocus && onFocus(id, value)}
            options={options}
            selectedKey={value || null}
            responsiveMode={ResponsiveMode.large}
            disabled={disabled || options.length === 1}
            placeholder={options.length > 1 ? placeholder : formatMessage('No intents configured for this dialog')}
          />
        </>
      )}
      {type === SDKTypes.LuisRecognizer && <LuEditorWidget formContext={formContext} name={value} height={316} />}
      {type === SDKTypes.RegexRecognizer && <RegexEditorWidget formContext={formContext} name={value} />}
    </>
  );
};
