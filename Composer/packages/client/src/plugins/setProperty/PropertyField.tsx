// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import React from 'react';
import { SharedColors, NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { TagPicker } from 'office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker';
import { ITag } from 'office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker.types';
import { useId } from '@uifabric/react-hooks';
import { Stack } from 'office-ui-fabric-react/lib/Stack';

const ActionDescription = styled.div({
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
  margin: '10px 0',
  textAlign: 'left',
  border: `2px solid ${SharedColors.gray10}`,
  padding: '5px',
});

type Props = {
  value: any;
  dataType: string;
  onPropertyNameChange: (value?: any) => void;
};

export const PropertyField: React.FC<Props> = ({ value, dataType, onPropertyNameChange }) => {
  const pickerId = useId('inline-picker');
  const [selectedTagPickerItems, setSelectedTagPickerItems] = React.useState<ITag[]>([]);

  React.useEffect(() => {
    if (value) {
      const split = value.split('.');
      const lastPathSegment = split.length > 1 ? split[split.length - 1] : '';
      const displayTag = `${lastPathSegment} (${dataType})`;
      setSelectedTagPickerItems([
        {
          key: value,
          name: displayTag,
        },
      ]);
    }
  }, [dataType]);

  const handleResolveSuggestion = React.useCallback((filterItem: string): ITag[] => {
    return [
      {
        key: filterItem,
        name: filterItem,
      },
    ];
  }, []);

  const handleTagPickerItemSelected = React.useCallback(
    (current: ITag | undefined) => {
      if (current) {
        onPropertyNameChange(`dialog.${current?.name}`);
        setSelectedTagPickerItems([{ ...current, name: `${current.name} (${dataType})` }]);
      }
      return null;
    },
    [dataType, onPropertyNameChange]
  );

  const handleChange = React.useCallback(
    (items?: ITag[]) => {
      if (items?.length) {
        const [{ name }] = items;
        setSelectedTagPickerItems([]);
        onPropertyNameChange(name);
      } else {
        setSelectedTagPickerItems([]);
        onPropertyNameChange();
      }
    },
    [onPropertyNameChange]
  );

  return (
    <Stack tokens={{ childrenGap: '8px' }}>
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
        onChange={handleChange}
        onItemSelected={handleTagPickerItemSelected}
        onResolveSuggestions={handleResolveSuggestion}
      />
      <ActionDescription>{formatMessage('Set to')}</ActionDescription>
    </Stack>
  );
};
