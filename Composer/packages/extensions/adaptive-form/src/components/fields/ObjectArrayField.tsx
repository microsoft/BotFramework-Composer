// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo } from 'react';
import { FieldProps } from '@bfc/extension';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { JSONSchema7 } from 'json-schema';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import map from 'lodash/map';

import { getArrayItemProps, getOrderedProperties, generateArrayItems, ArrayItem, createArrayItem } from '../../utils';
import { FieldLabel } from '../FieldLabel';

import { objectArrayField } from './styles';
import { ArrayFieldItem } from './ArrayFieldItem';
import { UnsupportedField } from './UnsupportedField';

const getNewPlaceholder = (props: FieldProps<any[]>, propertyName: string): string | undefined => {
  const { uiOptions } = props;
  const placeholderOverride = uiOptions.properties?.[propertyName]?.placeholder;

  if (placeholderOverride) {
    return typeof placeholderOverride === 'function' ? placeholderOverride(undefined) : placeholderOverride;
  }

  return formatMessage('Add new {propertyName}', { propertyName });
};

const ObjectArrayField: React.FC<FieldProps<any[]>> = props => {
  const { value = [], schema, id, onChange, className, uiOptions, label, description } = props;
  const { items } = schema;
  const itemSchema = Array.isArray(items) ? items[0] : items;
  const properties = (itemSchema && itemSchema !== true && itemSchema.properties) || {};
  const [newObject, setNewObject] = useState({});
  const [itemCache, setItemCache] = useState<ArrayItem[]>(generateArrayItems(value));

  const handleNewObjectChange = (property: string) => (_e: React.FormEvent, newValue?: string) => {
    setNewObject({ ...newObject, [property]: newValue });
  };

  const handleChange = (items: ArrayItem[]) => {
    setItemCache(items);
    onChange(items.map(i => i.value));
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();

      if (Object.keys(newObject).length) {
        handleChange(itemCache.concat([createArrayItem(newObject)]));
        setNewObject({});
      }
    }
  };

  const handleAdd = () => {
    handleChange(itemCache.concat(createArrayItem({})));
  };

  const orderedProperties = getOrderedProperties(
    itemSchema && typeof itemSchema !== 'boolean' ? itemSchema : {},
    uiOptions,
    value
  );

  const stackArrayItems = useMemo(
    () =>
      orderedProperties.length > 2 ||
      !!Object.entries(properties).filter(
        ([key, { $role }]: any) => orderedProperties.includes(key) && $role === 'expression'
      ).length,
    [itemSchema, orderedProperties]
  );

  if (!itemSchema || itemSchema === true) {
    return <UnsupportedField {...props} />;
  }

  return (
    <div className={className}>
      <FieldLabel description={description} id={id} label={label} helpLink={uiOptions?.helpLink} />
      <div>
        {orderedProperties.length > 1 && !stackArrayItems && (
          <div css={objectArrayField.objectItemLabel}>
            {orderedProperties.map((key, index) => {
              if (typeof key === 'string') {
                const propSchema = properties[key];

                if (propSchema && propSchema !== true) {
                  return (
                    <div key={index} css={objectArrayField.objectItemValueLabel}>
                      <FieldLabel
                        description={propSchema.description}
                        id={`${id}.${key}`}
                        inline
                        label={propSchema.title}
                      />
                    </div>
                  );
                }
              }
            })}
            <div style={{ width: '32px' }} />
          </div>
        )}
        {map(itemCache, (item, idx) => (
          <ArrayFieldItem
            key={item.id}
            {...props}
            id={`${id}.${idx}`}
            schema={itemSchema as JSONSchema7}
            stackArrayItems={stackArrayItems}
            transparentBorder
            value={item.value}
            {...getArrayItemProps(itemCache, idx, handleChange)}
          />
        ))}
      </div>
      <div css={objectArrayField.inputFieldContainer}>
        {!stackArrayItems ? (
          <React.Fragment>
            <div css={objectArrayField.arrayItemField}>
              {orderedProperties
                .filter(p => !Array.isArray(p))
                .map((property, index, allProperties) => {
                  if (typeof property === 'string') {
                    return (
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
                    );
                  }
                })}
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
          </React.Fragment>
        ) : (
          <DefaultButton type="button" onClick={handleAdd}>
            {formatMessage('Add')}
          </DefaultButton>
        )}
      </div>
    </div>
  );
};

export { ObjectArrayField };
