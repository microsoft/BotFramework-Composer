// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenConfirmModal } from '@bfc/ui-shared';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';

import { FieldLabel } from '../../common/FieldLabel';
import { ValuePicker } from '../../common/ValuePicker';

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
  locale: string;
  propertyType: string;
  $examples: any;
  exampleData: Record<string, Record<string, string[]>>;
  onChange: (value: Record<string, Record<string, string[]>>) => void;
};

export const StringExampleContent = (props: Props) => {
  const {
    locale: currentLocale,
    propertyType,
    $examples: { title, description, ...$localeGenerator },
    exampleData,
    onChange,
  } = props;

  const entityName = React.useMemo(
    () =>
      exampleData[currentLocale] && Object.keys(exampleData[currentLocale])
        ? Object.keys(exampleData[currentLocale])[0]
        : propertyType,
    [exampleData, propertyType, currentLocale]
  );

  const addLocale = () => {
    onChange({ ...exampleData, [currentLocale]: { [entityName]: [] } });
  };

  const deleteLocale = (locale: string) => async () => {
    const confirm = await OpenConfirmModal(
      formatMessage('Delete "{locale}" examples?', { locale }),
      formatMessage('Are you sure you want to remove examples for "{locale}" locale?', { locale })
    );
    if (confirm) {
      const newExampleData = { ...exampleData };
      delete newExampleData[locale];
      onChange(newExampleData);
    }
  };

  const changeValues = (values: string[]) => {
    onChange({ ...exampleData, [currentLocale]: { [entityName]: values } });
  };

  const renderLabel = (helpText: string, tooltipId: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any, defaultRender?: (props: any) => JSX.Element | null) => (
      <FieldLabel defaultRender={defaultRender(props)} helpText={helpText} tooltipId={tooltipId} />
    );

  return (
    <Container disabled={!propertyType} tokens={{ childrenGap: 8 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
        <FieldLabel defaultRender={<Label>{title}</Label>} helpText={description} tooltipId="examples" />
        <IconButton disabled={!!exampleData?.[currentLocale]} iconProps={{ iconName: 'Add' }} onClick={addLocale} />
      </Stack>
      {Object.keys(exampleData).map((locale) => (
        <Stack key={locale} tokens={{ childrenGap: 8 }}>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
            <FieldLabel
              defaultRender={
                <Label>{`${$localeGenerator.additionalProperties.title}: ${locale || formatMessage('All')}`}</Label>
              }
              helpText={$localeGenerator.additionalProperties.description}
              tooltipId={locale}
            />
            <IconButton iconProps={{ iconName: 'Trash' }} onClick={deleteLocale(locale)} />
          </Stack>
          {exampleData?.[locale]?.[propertyType] && (
            <ValuePicker
              label={formatMessage('Entity')}
              values={exampleData[locale][propertyType]}
              onChange={changeValues}
              onRenderLabel={renderLabel(formatMessage('Examples for entity'), `${locale}-${entityName}`)}
            />
          )}
        </Stack>
      ))}
    </Container>
  );
};
