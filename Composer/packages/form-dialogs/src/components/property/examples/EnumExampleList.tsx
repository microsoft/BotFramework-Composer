// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenConfirmModal } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import cloneDeep from 'lodash/cloneDeep';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import React from 'react';
import styled from '@emotion/styled';

import { FieldLabel } from '../../common/FieldLabel';
import { ValuePicker } from '../../common/ValuePicker';

const ValuePickerContainer = styled.div({
  display: 'flex',
  flex: 3,
  alignItems: 'center',
});

type ExampleData = Record<string, Record<string, Record<string, string[]>>>;
type ListItemData = {
  word: string;
  synonyms: string[];
};

const Row = ({ item, onEdit }: { item: ListItemData; onEdit: () => void }) => {
  return (
    <Stack horizontal styles={{ root: { height: 36 } }} tokens={{ childrenGap: 16 }} verticalAlign="center">
      <Text styles={{ root: { width: 160 } }}>{item.word}</Text>
      <Stack styles={{ root: { flex: 1 } }}>
        <Text>{(item.synonyms ?? []).join(', ')}</Text>
      </Stack>
      <IconButton iconProps={{ iconName: 'Edit' }} onClick={onEdit} />
    </Stack>
  );
};

const EditableRow = ({
  item,
  onChange,
  onSave,
}: {
  item: ListItemData;
  onChange: (word: string, synonyms: string[]) => void;
  onSave: () => void;
}) => {
  const valuePickerContainerRef = React.useRef<HTMLDivElement>();
  const valuePickerInputRef = React.useRef<HTMLInputElement>();

  const synonymsChange = (synonyms: string[]) => onChange(item.word, synonyms);

  React.useEffect(() => {
    valuePickerInputRef.current = valuePickerContainerRef.current.querySelector('input');
    valuePickerInputRef.current.focus();

    const keydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSave();
      }
    };

    valuePickerInputRef.current.addEventListener('keydown', keydown);

    return () => valuePickerInputRef.current.removeEventListener('keydown', keydown);
  }, []);

  return (
    <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
      <Stack styles={{ root: { width: 160 } }}>
        <Text>{item.word}</Text>
      </Stack>
      <ValuePickerContainer ref={valuePickerContainerRef}>
        <ValuePicker values={item.synonyms ?? []} onChange={synonymsChange} />
      </ValuePickerContainer>
      <IconButton iconProps={{ iconName: 'Accept' }} onClick={onSave} />
    </Stack>
  );
};

type Props = {
  entityName: string;
  $localeGenerator: Record<string, any>;
  exampleData?: ExampleData;
  onChange: (exampleData: ExampleData) => void;
};

export const EnumExampleList = (props: Props) => {
  const { entityName, $localeGenerator, exampleData = {}, onChange } = props;

  const [activeRowIndex, setActiveRowIndex] = React.useState(-1);

  const itemsRecord = React.useMemo<Record<string, ListItemData[]>>(() => {
    return Object.keys(exampleData).reduce((a, locale) => {
      a[locale] =
        Object.keys(exampleData[locale]?.[entityName])?.reduce((b, word) => {
          b.push({ word, synonyms: exampleData[locale]?.[entityName]?.[word] ?? [] });
          return b;
        }, [] as ListItemData[]) ?? [];

      return a;
    }, {} as Record<string, ListItemData[]>);
  }, [exampleData, entityName]);

  const rowChange = (locale: string, idx: number) => (word: string, synonyms: string[]) => {
    const newExampleData = cloneDeep(exampleData);
    const changingKey = Object.keys(newExampleData[locale][entityName])[idx];
    newExampleData[locale][entityName][word] = synonyms;
    if (changingKey === '') {
      delete newExampleData[locale][entityName][changingKey];
    }

    onChange(newExampleData);
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

  const editRow = (index: number) => () => setActiveRowIndex(index);

  const saveRow = () => setActiveRowIndex(-1);

  const renderCell = (locale: string) => (item: ListItemData, idx: number) => {
    return (
      <Stack key={`${item.word}-${idx}`}>
        {idx === activeRowIndex ? (
          <EditableRow item={item} onChange={rowChange(locale, idx)} onSave={saveRow} />
        ) : (
          <Row item={item} onEdit={editRow(idx)} />
        )}
      </Stack>
    );
  };

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {Object.keys(itemsRecord).map((locale) => (
        <Stack key={locale} tokens={{ childrenGap: 8 }}>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
            <FieldLabel
              defaultRender={<Label>{`${$localeGenerator.title}: ${locale || formatMessage('All')}`}</Label>}
              helpText={$localeGenerator.description}
              tooltipId={locale}
            />
            <IconButton iconProps={{ iconName: 'Trash' }} onClick={deleteLocale(locale)} />
          </Stack>
          <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
            <Stack styles={{ root: { width: 160 } }}>
              <FieldLabel
                defaultRender={<Label>{formatMessage('Accepted values')}</Label>}
                helpText={'Enum value'}
                tooltipId="synonyms_header"
              />
            </Stack>
            <Stack styles={{ root: { flex: 1 } }}>
              <FieldLabel
                defaultRender={<Label>{formatMessage('Synonyms')}</Label>}
                helpText={formatMessage('Enum examples for each possible value.')}
                tooltipId="synonyms_header"
              />
            </Stack>
          </Stack>
          {itemsRecord[locale].map(renderCell(locale))}
        </Stack>
      ))}
    </Stack>
  );
};
