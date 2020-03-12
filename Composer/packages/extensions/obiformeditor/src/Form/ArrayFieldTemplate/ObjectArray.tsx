// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useCallback, useMemo, useState } from 'react';
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
import { arrayItemInputFieldContainer, objectItemLabel, objectItemInputField, objectItemValueLabel } from './styles';

const ObjectArray: React.FunctionComponent<ArrayFieldTemplateProps> = props => {
  const { canAdd, idSchema, items, onAddClick, schema = {}, uiSchema = {} } = props;
  const { object } = (uiSchema['ui:options'] || {}) as any;
  const { items: itemSchema = {} } = schema;
  const { properties = {} } = itemSchema as JSONSchema6;

  const [value, setValue] = useState({});

  const handleChange = useCallback(
    property => (_, newValue?: string) => {
      setValue(currentValue => ({ ...currentValue, [property]: newValue || '' }));
    },
    [setValue]
  );

  const handleKeyDown = useCallback(
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

  const isVisible = useCallback(
    (property: string) => {
      const { items: itemsSchema } = uiSchema;
      return !(
        itemsSchema['ui:hidden'] &&
        Array.isArray(itemsSchema['ui:hidden']) &&
        itemsSchema['ui:hidden'].includes(property)
      );
    },
    [uiSchema]
  );

  const objectProperties = useMemo(() => Object.keys(properties).filter(isVisible), [properties]);

  return (
    <BaseField {...props}>
      {object && (
        <div css={objectItemLabel}>
          {objectProperties.length > 1 &&
            objectProperties.map((key, index) => {
              const { description, title } = properties[key] as JSONSchema6;
              const { __id = '' } = idSchema[key] || {};

              return (
                <div css={objectItemValueLabel} key={index}>
                  <WidgetLabel description={description} label={title} inline={true} id={__id} />
                </div>
              );
            })}
          <div style={{ width: '32px' }} />
        </div>
      )}
      <div className="ObjectArray">
        {items.map((element, idx) => (
          <ArrayItem {...element} key={idx} />
        ))}
        {canAdd &&
          (!object ? (
            <div css={arrayItemInputFieldContainer}>
              <DefaultButton type="button" onClick={onAddClick} data-testid="ArrayContainerAdd">
                {formatMessage('Add')}
              </DefaultButton>
            </div>
          ) : (
            <div css={arrayItemInputFieldContainer}>
              {objectProperties.map((property, index, items) => (
                <div css={objectItemInputField} key={index}>
                  <TextField
                    autoComplete="off"
                    onChange={handleChange(property)}
                    onKeyDown={handleKeyDown}
                    placeholder={`${formatMessage('Add new')} ${property}`}
                    value={value[property] || ''}
                    iconProps={{
                      ...(index === items.length - 1
                        ? {
                            iconName: 'ReturnKey',
                            style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
                          }
                        : {}),
                    }}
                    ariaLabel={formatMessage('Object')}
                    data-testid="object-array-text-input"
                  />
                </div>
              ))}
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
