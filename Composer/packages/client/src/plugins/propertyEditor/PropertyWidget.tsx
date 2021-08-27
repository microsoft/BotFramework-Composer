// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import React from 'react';
import { useShellApi, WidgetContainerProps } from '@bfc/extension-client';
import { SchemaField } from '@bfc/adaptive-form/lib';

const StyledSchemaField = styled(SchemaField)({
  margin: '-8px 0px',
});

export const PropertyWidget: React.FC<WidgetContainerProps> = ({ adaptiveSchema, data, id }) => {
  const { shellApi, schemas } = useShellApi();
  const { saveData } = shellApi;
  const { default: defaultSchema } = schemas;

  const handleChange = React.useCallback((newData: any) => {
    saveData(newData, id);
  }, []);

  // need to prevent the flow from stealing focus
  const handleClick = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return (
    <div onClick={handleClick}>
      <StyledSchemaField
        disableIntellisense
        definitions={defaultSchema?.definitions || {}}
        id="property"
        name="property"
        schema={adaptiveSchema}
        uiOptions={{}}
        value={data}
        onChange={handleChange}
      />
    </div>
  );
};
