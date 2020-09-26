// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { Dropdown, DropdownMenuItemType, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { formDialogTemplatesAtom } from 'src/atoms/appState';
import {
  ArrayPropertyPayload,
  BuiltInStringFormat,
  builtInStringFormats,
  FormDialogPropertyPayload,
  NumberPropertyPayload,
  RefPropertyPayload,
  SchemaPropertyKind,
  StringPropertyPayload,
} from 'src/atoms/types';
import { FieldLabel } from 'src/components/common/FieldLabel';

const processSelection = (
  isArray: boolean,
  oldKind: SchemaPropertyKind,
  newKind: SchemaPropertyKind,
  selectedKey: string,
  payload: FormDialogPropertyPayload
): FormDialogPropertyPayload => {
  if (isArray) {
    return processSelection(
      false,
      (payload as ArrayPropertyPayload).items.kind,
      newKind,
      selectedKey,
      (payload as ArrayPropertyPayload).items
    );
  }

  if (oldKind === newKind) {
    switch (newKind) {
      case 'string':
        return {
          ...payload,
          enums: selectedKey === 'enums' ? [] : undefined,
          format:
            selectedKey !== 'string' && selectedKey !== 'enums' ? (selectedKey as BuiltInStringFormat) : undefined,
        } as StringPropertyPayload;
      case 'number':
        return { kind: 'number' } as NumberPropertyPayload;
      case 'ref':
        return { ...payload, ref: selectedKey } as RefPropertyPayload;
    }
  } else {
    switch (newKind) {
      case 'string':
        return { kind: newKind, format: selectedKey as BuiltInStringFormat } as StringPropertyPayload;
      case 'number':
        return { kind: newKind } as NumberPropertyPayload;
      case 'ref':
        return { kind: newKind, ref: selectedKey } as RefPropertyPayload;
    }
  }
};

type Props = {
  isArray: boolean;
  kind: SchemaPropertyKind;
  payload: FormDialogPropertyPayload;
  onChange: (kind: SchemaPropertyKind, payload?: FormDialogPropertyPayload) => void;
};

export const PropertyTypeSelector = React.memo((props: Props) => {
  const { isArray, kind, payload, onChange } = props;

  const propertyTypeTooltipId = useId('propertyType');
  const isEnumList = kind === 'string' && !!(payload as StringPropertyPayload).enums;

  const templates = useRecoilValue(formDialogTemplatesAtom);
  const templateOptions = React.useMemo(
    () =>
      templates.map<IDropdownOption>((t) => ({
        key: t,
        text: t,
        selected: kind === 'ref' && (payload as RefPropertyPayload).ref === t,
        data: 'ref',
      })),
    [templates, payload, kind]
  );

  const stringOptions = React.useMemo(
    () =>
      builtInStringFormats.map<IDropdownOption>((builtInFormat) => ({
        key: builtInFormat.value,
        text: builtInFormat.displayName,
        selected: kind === 'string' && (payload as StringPropertyPayload).format === builtInFormat.value,
        data: 'string',
      })),
    [payload, kind]
  );

  const dynamicOptions = React.useMemo(
    () =>
      [
        { key: 'number', text: formatMessage('number'), selected: kind === 'number', data: 'number' },
        { key: 'string', text: formatMessage('any string'), selected: kind === 'string', data: 'string' },
        ...stringOptions,
        ...templateOptions,
      ].sort((a, b) => a.text.localeCompare(b.text)) as IDropdownOption[],
    [kind, stringOptions, templateOptions]
  );

  const options = React.useMemo(() => {
    return [
      {
        key: 'enums',
        text: formatMessage('list'),
        selected: isEnumList,
        data: 'string',
      } as IDropdownOption,
      {
        itemType: DropdownMenuItemType.Divider,
      } as IDropdownOption,
      {
        itemType: DropdownMenuItemType.Header,
        text: formatMessage('Define by value type'),
      } as IDropdownOption,
      ...dynamicOptions,
    ];
  }, [isEnumList, dynamicOptions]);

  const selectedKey = React.useMemo(() => options.find((o) => o.selected).key, [options]);

  const change = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
      const newKind = option.data as SchemaPropertyKind;
      const selectedKey = option.key as string;
      const newPayload = processSelection(isArray, kind, newKind, selectedKey, payload);
      onChange(newKind, newPayload);
    },
    [payload, isArray, kind, onChange]
  );

  const onRenderLabel = React.useCallback(
    (helpText: string, tooltipId: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: any, defaultRender?: (props: any) => JSX.Element | null) => (
        <FieldLabel defaultRender={defaultRender(props)} helpText={helpText} tooltipId={tooltipId} />
      ),
    []
  );

  return (
    <Dropdown
      aria-describedby={propertyTypeTooltipId}
      calloutProps={{ calloutMaxHeight: 400 }}
      label={formatMessage('Property Type')}
      options={options}
      selectedKey={selectedKey}
      styles={{ root: { minWidth: 200 } }}
      onChange={change}
      onRenderLabel={onRenderLabel(formatMessage('Property type help text'), propertyTypeTooltipId)}
    />
  );
});
