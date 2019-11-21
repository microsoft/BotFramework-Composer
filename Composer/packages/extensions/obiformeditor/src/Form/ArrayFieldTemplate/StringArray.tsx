// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useState } from 'react';
import { ArrayFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { BaseField } from '../fields/BaseField';

import { arrayItemField, arrayItemInputFieldContainer } from './styles';
import ArrayItem from './ArrayItem';

const StringArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { canAdd, items, onAddClick } = props;
  const [value, setValue] = useState('');

  const handleOnChange = useCallback((_, newValue?: string) => setValue(newValue || ''), [setValue]);

  const handleOnKeyDown = useCallback(
    event => {
      if (event.key.toLowerCase() === 'enter') {
        event.preventDefault();

        if (value) {
          onAddClick(event, value);
          setValue('');
        }
      }
    },
    [onAddClick, setValue, value]
  );

  return (
    <BaseField {...props}>
      <div>
        {items.map((element, idx) => (
          <ArrayItem {...element} key={idx} />
        ))}
      </div>
      {canAdd && (
        <div css={arrayItemInputFieldContainer}>
          <div css={arrayItemField}>
            <TextField
              onChange={handleOnChange}
              onKeyDown={handleOnKeyDown}
              value={value}
              iconProps={{
                iconName: 'ReturnKey',
                style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
              }}
            />
          </div>
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
      )}
    </BaseField>
  );
};

StringArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default StringArray;
