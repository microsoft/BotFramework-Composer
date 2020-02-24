// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { FieldProps } from '@bfc/extension';
import map from 'lodash/map';
import { JSONSchema4 } from 'json-schema';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { getArrayItemProps, getOrderedProperties } from '../../utils';
import { FieldLabel } from '../FieldLabel';

import { objectArrayField } from './styles';
import { ArrayFieldItem } from './ArrayFieldItem';

const getNewPlaceholder = (props: FieldProps<any[]>, propertyName: string): string | undefined => {
  const { uiOptions } = props;
  const placeholderOverride = uiOptions.properties?.[propertyName]?.placeholder;

  if (placeholderOverride) {
    return typeof placeholderOverride === 'function' ? placeholderOverride(undefined) : placeholderOverride;
  }

  return formatMessage(`Add new ${propertyName}`);
};

const ObjectArrayField: React.FC<FieldProps<any[]>> = props => {
  const { value = [], schema, id, onChange, className, uiOptions, label, description } = props;
  const { items } = schema;
  const itemSchema = Array.isArray(items) ? items[0] : items;
  const properties = itemSchema?.properties || {};
  const [newObject, setNewObject] = useState({});

  const handleNewObjectChange = (property: string) => (_e: React.FormEvent, newValue?: string) => {
    setNewObject({ ...newObject, [property]: newValue });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();

      if (Object.keys(newObject).length) {
        onChange(value.concat([newObject]));
        setNewObject({});
      }
    }
  };

  const orderedProperties = getOrderedProperties(itemSchema || {}, uiOptions, value);
  return (
    <div className={className}>
      <FieldLabel description={description} id={id} label={label} />
      <div>
        {orderedProperties.length > 1 && (
          <div css={objectArrayField.objectItemLabel}>
            {orderedProperties.map((key, index) => {
              const { description, title } = properties[key];

              return (
                <div key={index} css={objectArrayField.objectItemValueLabel}>
                  <FieldLabel description={description} id={`${id}.${key}`} inline={true} label={title} />
                </div>
              );
            })}
            <div style={{ width: '32px' }} />
          </div>
        )}
        {map(value, (item, idx) => (
          <ArrayFieldItem
            {...props}
            transparentBorder
            key={idx}
            id={`${id}.${idx}`}
            schema={itemSchema as JSONSchema4}
            value={item}
            {...getArrayItemProps(value, idx, onChange)}
          />
        ))}
      </div>
      <div css={objectArrayField.inputFieldContainer}>
        <div css={objectArrayField.arrayItemField}>
          {orderedProperties.map((property, index, allProperties) => (
            <div key={index} css={objectArrayField.objectItemInputField}>
              <TextField
                autoComplete="off"
                iconProps={{
                  ...(index === allProperties.length - 1
                    ? {
                        iconName: 'ReturnKey',
                        style: {
                          color: SharedColors.cyanBlue10,
                          opacity: 0.6,
                        },
                      }
                    : {}),
                }}
                placeholder={getNewPlaceholder(props, property)}
                styles={{ field: { padding: '0 24px 0 8px' } }}
                value={newObject[property] || ''}
                onChange={handleNewObjectChange(property)}
                onKeyDown={handleKeyDown}
              />
            </div>
          ))}
        </div>
        <IconButton
          disabled
          ariaLabel="Item Actions"
          menuIconProps={{ iconName: 'MoreVertical' }}
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
  );
};

export { ObjectArrayField };
