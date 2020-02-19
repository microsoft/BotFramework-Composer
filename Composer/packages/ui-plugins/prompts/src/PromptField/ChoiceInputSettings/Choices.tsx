// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { FieldProps } from '@bfc/extension';
import { IChoice } from '@bfc/shared';
import { SchemaField, FieldLabel, getLabel } from '@bfc/adaptive-form';

const Choices: React.FC<FieldProps<IChoice>> = props => {
  const { id, value, onChange, schema } = props;
  const currentSchema = useMemo(() => {
    if (schema.type === 'array') {
      return schema;
    }

    if (!schema.anyOf && schema.items) {
      return Array.isArray(schema.items) ? schema.items[0] : schema.items;
    }

    if (Array.isArray(schema.anyOf)) {
      if (typeof value === 'string') {
        return schema.anyOf.find(s => s.type === 'string');
      }

      return schema.anyOf.find(s => {
        if (s.type === 'array') {
          if (Array.isArray(s.items)) {
            return s.items.some(i => i.type === 'object');
          } else {
            return s.items?.type === 'object';
          }
        }
      });
    }
  }, [schema, value]);

  const options = useMemo(() => {
    if (schema.anyOf) {
      return [
        { key: 'static', text: formatMessage('Static') },
        { key: 'dynamic', text: formatMessage('Dynamic') },
      ];
    }
  }, [schema.anyOf]);

  const [choiceType, setChoiceType] = useState(Array.isArray(value || []) ? 'static' : 'dynamic');

  const handleSchemaChange = useCallback(
    (_, { key }) => {
      onChange(choiceType !== 'static' ? [] : '');
      setChoiceType(key);
    },
    [choiceType, onchange, setChoiceType]
  );

  useEffect(() => {
    setChoiceType(Array.isArray(value ?? []) && typeof value !== 'string' ? 'static' : 'dynamic');
  }, [value]);

  if (!currentSchema) {
    return null;
  }

  return (
    <React.Fragment>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '5px 0',
        }}
      >
        <FieldLabel
          description={
            formatMessage('A list of options to present to the user.') +
            (choiceType === 'static'
              ? formatMessage(" Synonyms can be used to allow for variation in a user's response.")
              : '')
          }
          id={id}
          label={getLabel(props)}
        />
        {options && options.length > 0 && (
          <Dropdown
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={choiceType}
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { padding: '7px 0', width: '100px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
            onChange={handleSchemaChange}
          />
        )}
      </div>
      {currentSchema && (
        <SchemaField
          {...props}
          label={false}
          placeholder={currentSchema.description}
          schema={currentSchema}
          value={value}
        />
      )}
    </React.Fragment>
  );
};

export { Choices };
