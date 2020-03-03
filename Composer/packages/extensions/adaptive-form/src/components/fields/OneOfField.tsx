// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useEffect } from 'react';
import { FieldProps, JSONSchema7 } from '@bfc/extension';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';

import { FieldLabel } from '../FieldLabel';

import { oneOfField } from './styles';

const OneOfField: React.FC<FieldProps> = props => {
  const { schema, value } = props;
  const [selectedSchema, setSelectedSchema] = useState<JSONSchema7 | null>(null);

  const oneOf = schema.oneOf;
  const options =
    oneOf &&
    (oneOf
      .map(s => {
        if (typeof s === 'object') {
          return {
            key: s.type as React.ReactText,
            text: s.type === 'string' ? 'expression' : (s.type as string),
            data: { schema: s },
          } as IDropdownOption;
        }
      })
      .filter(Boolean) as IDropdownOption[]);

  useEffect(() => {
    if (options) {
      if (!value) {
        setSelectedSchema(options[0].data.schema);
      } else {
        const selected = options.find(o => typeof value === o.key);
        setSelectedSchema(selected?.data.schema || options[0].data.schema);
      }
    }
  }, []);

  const handleTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setSelectedSchema(option.data.schema);
    }
  };

  return (
    <React.Fragment>
      <div css={oneOfField.label}>
        <FieldLabel {...props} />
        {options && (
          <Dropdown
            id={`${props.id}-oneOf`}
            options={options}
            responsiveMode={ResponsiveMode.large}
            selectedKey={selectedSchema?.type}
            onChange={handleTypeChange}
            styles={{
              caretDownWrapper: { height: '24px', lineHeight: '24px' },
              root: { padding: '7px 0', width: '100px' },
              title: { height: '24px', lineHeight: '20px' },
            }}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export { OneOfField };
