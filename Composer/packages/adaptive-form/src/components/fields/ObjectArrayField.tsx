// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useMemo, useRef } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField, ITextField } from 'office-ui-fabric-react/lib/TextField';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import map from 'lodash/map';

import { getArrayItemProps, getOrderedProperties, useArrayItems, resolveRef, isPropertyHidden } from '../../utils';
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

const ObjectArrayField: React.FC<FieldProps<any[]>> = (props) => {
  const { value = [], schema, id, onChange, className, uiOptions, label, description, required } = props;
  const { items } = schema;
  const itemSchema = Array.isArray(items) ? items[0] : items;
  const properties = (itemSchema && itemSchema !== true && itemSchema.properties) || {};
  const [newObject, setNewObject] = useState({});
  const { arrayItems, handleChange, addItem } = useArrayItems(value, onChange);
  const firstNewFieldRef: React.RefObject<ITextField> = useRef(null);
  const { announce } = useShellApi().shellApi;

  const moreLabel = formatMessage('Item actions');

  const END_OF_ROW_LABEL = formatMessage('press Enter to add this item or Tab to move to the next interactive element');

  const INSIDE_ROW_LABEL = formatMessage(
    'press Enter to add this name and advance to the next row, or press Tab to advance to the value field'
  );

  const handleNewObjectChange = (property: string) => (_e: React.FormEvent, newValue?: string) => {
    setNewObject({ ...newObject, [property]: newValue });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key.toLowerCase() === 'enter') {
      event.preventDefault();

      if (Object.keys(newObject).length > 0) {
        const formattedData = Object.entries(newObject).reduce((obj, [key, value]) => {
          const serializeValue = uiOptions?.properties?.[key]?.serializer?.set;
          return { ...obj, [key]: typeof serializeValue === 'function' ? serializeValue(value) : value };
        }, {});

        announce(INSIDE_ROW_LABEL);
        addItem(formattedData);
        setNewObject({});
        firstNewFieldRef.current?.focus();
      }
    }
  };

  const handleAdd = () => {
    addItem({});
  };

  const orderedProperties = getOrderedProperties(
    itemSchema && typeof itemSchema !== 'boolean' ? itemSchema : {},
    uiOptions,
    value
  ).filter((property) => Array.isArray(property) || !isPropertyHidden(uiOptions, value, property));

  const stackArrayItems = useMemo(() => {
    const allOrderProps = orderedProperties.reduce((all: string[], prop: string | string[]) => {
      return [...all, ...(Array.isArray(prop) ? prop : [prop])];
    }, []);

    return (
      allOrderProps.length > 2 ||
      orderedProperties.some((property) => Array.isArray(property)) ||
      Object.entries(properties).some(([key, propSchema]) => {
        const resolved = resolveRef(propSchema, props.definitions);
        return allOrderProps.includes(key) && resolved.$role === 'expression';
      })
    );
  }, [itemSchema, orderedProperties]);

  if (!itemSchema || itemSchema === true) {
    return <UnsupportedField {...props} />;
  }

  return (
    <div className={className}>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
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
                        inline
                        description={propSchema.description}
                        id={`${id}.${key}`}
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
        {map(arrayItems, (item, idx) => (
          <ArrayFieldItem
            key={item.id}
            {...props}
            transparentBorder
            id={`${id}.${idx}`}
            schema={itemSchema}
            stackArrayItems={stackArrayItems}
            value={item.value}
            {...getArrayItemProps(arrayItems, idx, handleChange)}
          />
        ))}
      </div>
      <div css={objectArrayField.inputFieldContainer}>
        {!stackArrayItems ? (
          <React.Fragment>
            <div css={objectArrayField.arrayItemField}>
              {orderedProperties
                .filter((p) => !Array.isArray(p))
                .map((property, index, allProperties) => {
                  const lastField = index === allProperties.length - 1;
                  if (typeof property === 'string') {
                    return (
                      <div key={index} css={objectArrayField.objectItemInputField}>
                        <TextField
                          ariaLabel={lastField ? END_OF_ROW_LABEL : INSIDE_ROW_LABEL}
                          autoComplete="off"
                          componentRef={index === 0 ? firstNewFieldRef : undefined}
                          iconProps={{
                            ...(lastField
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
            <TooltipHost content={moreLabel}>
              <IconButton
                disabled
                ariaLabel={moreLabel}
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
            </TooltipHost>
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
