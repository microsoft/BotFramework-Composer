// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, DropdownMenuItemType, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Icon } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import formatMessage from 'format-message';
import * as React from 'react';
import { SchemaPropertyKind } from 'src/app/stores/schemaPropertyStore';

const getIcon = (kind: SchemaPropertyKind) => {
  switch (kind) {
    case 'ref':
      return 'GroupedList';
    case 'number':
      return 'NumberField';
    case 'string':
      return 'TextField';
    case 'array':
      return 'GroupList';
    default:
      return '';
  }
};

type Props = {
  kind: SchemaPropertyKind;
  onChange: (kind: SchemaPropertyKind) => void;
};

export const PropertyTypeSelector = React.memo((props: Props) => {
  const { kind, onChange } = props;

  const options = React.useMemo(() => {
    return [
      { key: 'header1', text: formatMessage('Manual'), itemType: DropdownMenuItemType.Header },
      { key: 'array', text: formatMessage('Array'), selected: kind === 'array' },
      { key: 'number', text: formatMessage('Number'), selected: kind === 'number' },
      { key: 'string', text: formatMessage('String'), selected: kind === 'string' },
      { key: 'divider', itemType: DropdownMenuItemType.Divider },
      { key: 'header2', text: formatMessage('Templates'), itemType: DropdownMenuItemType.Header },
      { key: 'ref', text: formatMessage('Use Templates'), selected: kind === 'ref' },
    ] as IDropdownOption[];
  }, [kind]);

  const change = (_e: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
    onChange(option.key as SchemaPropertyKind);
  };

  const renderOption = (
    optionProps: IDropdownOption,
    defaultRender?: (optionProps?: IDropdownOption) => JSX.Element
  ) => (
    <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
      <Icon iconName={getIcon(optionProps.key as SchemaPropertyKind)} />
      {defaultRender(optionProps)}
    </Stack>
  );

  const renderTitle = (
    optionProps: IDropdownOption[],
    defaultRender?: (optionProps?: IDropdownOption[]) => JSX.Element
  ) => (
    <Stack horizontal verticalAlign="center">
      <Icon iconName={getIcon(optionProps[0].key as SchemaPropertyKind)} styles={{ root: { marginRight: 8 } }} />
      {defaultRender(optionProps)}
    </Stack>
  );

  return (
    <Dropdown
      label={formatMessage('Select property type')}
      options={options}
      styles={{ root: { minWidth: 200 } }}
      onChange={change}
      onRenderOption={renderOption}
      onRenderTitle={renderTitle}
    />
  );
});
