// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useState } from 'react';
import { ArrayFieldTemplateProps } from '@bfcomposer/react-jsonschema-form';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { JSONSchema6 } from 'json-schema';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';

import { BaseField } from '../fields/BaseField';
import { WidgetLabel } from '../widgets/WidgetLabel';

import ArrayItem from './ArrayItem';

import {
  arrayItemInputFieldContainer,
  arrayItemField,
  objectItemLabel,
  objectItemInputField,
  objectItemValueLabel,
} from './styles';

const ObjectArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { canAdd, idSchema, items, onAddClick, schema, uiSchema } = props;
  const { object } = (uiSchema['ui:options'] || {}) as any;
  const { items: itemSchema } = schema;
  const { properties = {} } = itemSchema as JSONSchema6;

  const [value, setValue] = useState({});

  const handleOnChange = useCallback(
    property => (_, newValue?: string) => {
      setValue(currentValue => ({ ...currentValue, [property]: newValue || '' }));
    },
    [setValue]
  );

  const handleOnKeyDown = useCallback(
    event => {
      if (event.key.toLowerCase() === 'enter') {
        event.preventDefault();

        if (Object.keys(value).length) {
          onAddClick(event, value);
          setValue({});
        }
      }
    },
    [onAddClick, setValue, value]
  );

  return (
    <BaseField {...props}>
      {object && (
        <div css={objectItemLabel}>
          {Object.keys(properties).map((key, index) => {
            const { description, title } = properties[key] as JSONSchema6;
            const { __id = '' } = idSchema[key] || {};

            return (
              <div css={objectItemValueLabel} key={index}>
                <WidgetLabel description={description} label={title} inline={true} id={__id} />
              </div>
            );
          })}
        </div>
      )}
      <div className="ObjectArray">
        {items.map((element, idx) => (
          <ArrayItem {...element} key={idx} />
        ))}
        {canAdd &&
          (!object ? (
            <DefaultButton
              type="button"
              onClick={onAddClick}
              data-testid="ArrayContainerAdd"
              styles={{ root: { marginTop: '14px' } }}
            >
              {formatMessage('Add')}
            </DefaultButton>
          ) : (
            <div css={arrayItemInputFieldContainer}>
              <div css={arrayItemField}>
                {Object.keys(properties).map((property, index) => (
                  <div css={objectItemInputField} key={index}>
                    <TextField
                      onChange={handleOnChange(property)}
                      onKeyDown={handleOnKeyDown}
                      placeholder={formatMessage(`Add new ${property} here`)}
                      value={value[property] || ''}
                      iconProps={{
                        iconName: 'ReturnKey',
                        style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
                      }}
                    />
                  </div>
                ))}
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
          ))}
      </div>
    </BaseField>
  );
};

ObjectArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: () => {},
};

export default ObjectArray;
