// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { useShellApi, WidgetContainerProps } from '@bfc/extension-client';
import React from 'react';
import { SchemaField, getSelectedOption, getOptions } from '@bfc/adaptive-form/lib';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { SharedColors } from '@uifabric/fluent-theme/lib/fluent';

import { PropertyField } from './PropertyField';

const ValueField = styled(SchemaField)({
  margin: '0px',
  '& .ms-TextField-fieldGroup': {
    borderColor: SharedColors.gray10,
  },
  '& .ms-Dropdown-title, & .ms-Dropdown-title:hover ': {
    borderColor: SharedColors.gray10,
  },
});

export const SetPropertyWidget: React.FC<WidgetContainerProps> = ({ adaptiveSchema, data, id }) => {
  const { shellApi } = useShellApi();
  const { saveData } = shellApi;

  const { options } = React.useMemo(() => getOptions(adaptiveSchema.properties?.value || {}), [adaptiveSchema]);
  const initialSelectedOption = React.useMemo(
    () => getSelectedOption(data.value, options) || ({ key: '', data: { schema: undefined } } as IDropdownOption),
    []
  );

  const [selectedDataType, setSelectedDataType] = React.useState(initialSelectedOption.text || 'string');

  const handleChange = React.useCallback(
    (value) => {
      saveData(value, id);
    },
    [saveData]
  );

  const handlePropertyNameChange = React.useCallback(
    (property?: any) => {
      handleChange({
        ...data,
        property,
      });
    },
    [handleChange]
  );

  const handleValueChange = React.useCallback(
    (value) => {
      handleChange({
        ...data,
        value,
      });
    },
    [handleChange]
  );

  const handleTypeChange = React.useCallback((dataType: string) => {
    setSelectedDataType(dataType);
  }, []);

  // need to prevent the flow from stealing focus
  const handleClick = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div onClick={handleClick}>
      <PropertyField
        dataType={selectedDataType}
        value={data.property}
        onPropertyNameChange={handlePropertyNameChange}
      />
      <ValueField
        disableIntellisense
        definitions={{}}
        id="value"
        name="value"
        schema={adaptiveSchema.properties?.value || {}}
        uiOptions={{ label: false }}
        value={data.value}
        onChange={handleValueChange}
        onTypeChange={handleTypeChange}
      />
    </div>
  );
};
