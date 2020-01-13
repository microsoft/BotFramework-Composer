// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { JSONSchema6 } from 'json-schema';
import { IChoice } from '@bfc/shared';
import formatMessage from 'format-message';

import { FormContext } from '../../../types';
import { WidgetLabel } from '../../../widgets/WidgetLabel';

import { StaticChoices } from './StaticChoices';
import { DynamicChoices } from './DynamicChoices';

interface ChoicesProps {
  id: string;
  schema: JSONSchema6;
  formContext: FormContext;
  formData?: IChoice;
  label: string;
  onChange: (data: IChoice) => void;
}

export const Choices: React.FC<ChoicesProps> = props => {
  const {
    id,
    label,
    formContext,
    formData,
    onChange,
    schema: { oneOf = [] },
  } = props;
  const [dynamicSchema] = oneOf;

  const options = useMemo(() => oneOf.map(({ title = '' }: any) => ({ key: title.toLowerCase(), text: title })), [
    oneOf,
  ]);
  const [choiceType, setChoiceType] = useState(Array.isArray(formData || []) ? 'static' : 'dynamic');
  const handleChange = useCallback(
    (_, { key }) => {
      onChange(choiceType !== 'static' ? [] : '');
      setChoiceType(key);
    },
    [choiceType, onchange, setChoiceType]
  );

  useEffect(() => {
    setChoiceType(Array.isArray(formData ?? []) && typeof formData !== 'string' ? 'static' : 'dynamic');
  }, [formData]);

  return (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
        <WidgetLabel
          label={label}
          description={
            formatMessage('A list of options to present to the user.') +
            (choiceType === 'static'
              ? formatMessage(" Synonyms can be used to allow for variation in a user's response.")
              : '')
          }
          id={id}
        />
        {options.length > 0 && (
          <Dropdown
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { padding: '7px 0', width: '100px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
            onChange={handleChange}
            options={options}
            selectedKey={choiceType}
            responsiveMode={ResponsiveMode.large}
          />
        )}
      </div>
      {!options || choiceType === 'static' ? (
        <StaticChoices {...props} />
      ) : (
        <DynamicChoices {...props} formContext={formContext} schema={dynamicSchema as JSONSchema6} />
      )}
    </React.Fragment>
  );
};
