// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { WidgetContainerProps, useShellApi } from '@bfc/extension-client';
import React, { useState, useEffect } from 'react';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { TagPicker } from 'office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker';
import { ITag } from 'office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker.types';
import { useId } from '@uifabric/react-hooks';

const options: IDropdownOption[] = [
  { key: 'string', text: 'abc' },
  { key: 'number', text: '123' },
  { key: 'bool', text: 'y/n' },
  { key: 'array', text: '[ ]' },
  { key: 'object', text: '{ }' },
];

export const SetPropertyWidget: React.FC<WidgetContainerProps> = ({ id, data }) => {
  const { shellApi } = useShellApi();
  const [currentDataType, setCurrentDataType] = useState(options[0].key);
  const pickerId = useId('inline-picker');
  const [propertyValue, setPropertyValue] = useState<any>('');
  const [selectedTagPickerItems, setSelectedTagPickerItems] = useState<ITag[]>([]);

  useEffect(() => {
    let currentDt = options[0].key;
    if ((data.$designer as any)?.dataType) {
      currentDt = (data.$designer as any)?.dataType;
      setCurrentDataType(currentDt);
    }

    if (data.value) {
      if (typeof data.value === 'object') {
        setPropertyValue(JSON.stringify(data.value));
      } else {
        setPropertyValue(data.value);
      }
    }

    if (data.property) {
      // Avoid showing the memory model
      const split = data.property.split('.');
      const lastPathSegment = split.length > 1 ? split[split.length - 1] : '';
      const displayTag = `${lastPathSegment} (${currentDt})`;
      setSelectedTagPickerItems([
        {
          key: data.property,
          name: displayTag,
        },
      ]);
    }
  }, [data]);

  const onPropertyValueChange = (_, currentVal) => {
    setPropertyValue(currentVal);
  };

  const onDataTypeChange = (_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      setCurrentDataType(option.key);
    }
  };

  const handleUpdate = (val: any, dataType) => {
    shellApi.saveData(
      {
        ...data,
        value: val,
        $designer: {
          ...data.$designer,
          dataType,
        },
      },
      id
    );
  };

  const onPropertyValueBlur = () => {
    switch (currentDataType) {
      case 'string':
        handleUpdate(propertyValue, currentDataType);
        break;
      case 'number':
        handleUpdate(Number(propertyValue), currentDataType);
        break;

      default:
        try {
          const parsed = JSON.parse(propertyValue);
          handleUpdate(parsed, currentDataType);
        } catch {
          handleUpdate(propertyValue, 'string');
        }
        break;
    }
  };

  const onResolveSuggestion = (filterItem: string): ITag[] => {
    return [
      {
        key: filterItem,
        name: `${filterItem}`,
      },
    ];
  };

  const onTagPickerItemSelected = (current: ITag | undefined) => {
    if (current) {
      shellApi.saveData({ ...data, property: `dialog.${current?.name}` }, id);
      const dtName = options.find((option) => option.key === currentDataType);
      const updatedProperty = { ...current, name: `${current.name} (${dtName?.key})` };
      setSelectedTagPickerItems([updatedProperty]);
    }
    return null;
  };

  return (
    <div
      style={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
      }}
    >
      <TagPicker
        inputProps={{
          id: pickerId,
        }}
        itemLimit={1}
        pickerCalloutProps={{ doNotLayer: true }}
        selectedItems={selectedTagPickerItems}
        styles={{
          itemsWrapper: {
            color: 'black',
            border: 'none',
          },
          root: {
            selectors: {
              '.ms-BasePicker-text': {
                outline: 'none',
                border: `1px solid ${SharedColors.gray10}`,
              },
              '.ms-Suggestions-item': {
                display: 'none',
              },
              '.ms-TagItem': {
                backgroundColor: NeutralColors.gray20,
                color: NeutralColors.black,
                selectors: {
                  ':hover': {
                    backgroundColor: NeutralColors.gray20,
                  },
                },
              },
              '.ms-TagItem-close': {
                color: `black`,
                marginTop: '2px',
                selectors: {
                  ':hover': {
                    backgroundColor: NeutralColors.gray70,
                  },
                },
              },
            },
          },
        }}
        onChange={() => {
          setSelectedTagPickerItems([]);
          const { property, ...rest } = data;
          shellApi.saveData(rest, id);
        }}
        onItemSelected={onTagPickerItemSelected}
        onResolveSuggestions={onResolveSuggestion}
      />
      <div
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          margin: '10px 0',
          textAlign: 'left',
          border: `2px solid ${SharedColors.gray10}`,
          padding: '5px',
        }}
      >
        {formatMessage('Set to')}
      </div>
      <div
        style={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'row',
        }}
      >
        <Dropdown options={options} selectedKey={currentDataType} onChange={onDataTypeChange} />
        <TextField
          styles={{
            root: {
              height: '40px',
              width: '232px',
            },
          }}
          value={propertyValue}
          onBlur={onPropertyValueBlur}
          onChange={onPropertyValueChange}
        />
      </div>
    </div>
  );
};
