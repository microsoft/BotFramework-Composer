// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';

import { FieldLabel } from '../../common/FieldLabel';

import { EnumExampleList } from './EnumExampleList';

const Container = styled(Stack)(({ disabled }: { disabled: boolean }) => ({
  position: 'relative',
  '&:before': disabled
    ? {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: FluentTheme.palette.red,
        fontSize: FluentTheme.fonts.small.fontSize,
        content: `${formatMessage('Please add a name to this property to enable adding examples')}`,
        zIndex: 1,
      }
    : null,
  '&:after': disabled
    ? {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.75)',
        content: '""',
      }
    : null,
}));

type Props = {
  propertyName?: string;
  locale: string;
  $examples: any;
  enums: string[];
  exampleData: Record<string, Record<string, Record<string, string[]>>>;
  onChange: (value: Record<string, Record<string, Record<string, string[]>>>) => void;
};

export const EnumExampleContent = (props: Props) => {
  const {
    locale: currentLocale,
    propertyName = '',
    $examples: { title, description, ...rest },
    enums,
    exampleData,
    onChange,
  } = props;

  const entityName = React.useMemo(
    () =>
      exampleData[currentLocale] && Object.keys(exampleData[currentLocale])
        ? Object.keys(exampleData[currentLocale])[0]
        : `${propertyName}Value`,
    [exampleData, currentLocale, propertyName]
  );

  const addLocale = () => {
    onChange({ ...exampleData, [currentLocale]: { [entityName]: {} } });
  };

  return (
    <Container disabled={!propertyName} tokens={{ childrenGap: 8 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <FieldLabel defaultRender={<Label>{title}</Label>} helpText={description} tooltipId="examples" />
        <IconButton
          disabled={!enums?.length || !!exampleData?.[currentLocale]}
          iconProps={{ iconName: 'Add' }}
          onClick={addLocale}
        />
      </Stack>
      <EnumExampleList
        $localeGenerator={rest.additionalProperties}
        entityName={entityName}
        exampleData={exampleData}
        onChange={onChange}
      />
    </Container>
  );
};
