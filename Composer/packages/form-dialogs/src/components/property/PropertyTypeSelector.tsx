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
  IntegerPropertyPayload,
  NumberPropertyPayload,
  RefPropertyPayload,
  FormDialogPropertyKind,
  StringPropertyPayload,
} from 'src/atoms/types';
import { FieldLabel } from 'src/components/common/FieldLabel';

const processSelection = (
  isArray: boolean,
  oldKind: FormDialogPropertyKind,
  newKind: FormDialogPropertyKind,
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

  // If the property type hasn't changed, reset the payload and update the type required payload (string => format, ref => $ref)
  if (oldKind === newKind) {
    switch (newKind) {
      case 'string':
        return {
          ...payload,
          format:
            selectedKey !== 'string' && selectedKey !== 'enums' ? (selectedKey as BuiltInStringFormat) : undefined,
          enums: selectedKey === 'enums' ? [] : undefined,
        } as StringPropertyPayload;
      case 'number':
        return { kind: 'number' } as NumberPropertyPayload;
      case 'integer':
        return { kind: 'integer' } as IntegerPropertyPayload;
      case 'ref':
        return { ...payload, ref: selectedKey } as RefPropertyPayload;
    }
  } else {
    switch (newKind) {
      case 'string':
        return {
          kind: newKind,
          format:
            selectedKey !== 'string' && selectedKey !== 'enums' ? (selectedKey as BuiltInStringFormat) : undefined,
          enums: selectedKey === 'enums' ? [] : undefined,
        } as StringPropertyPayload;
      case 'number':
        return { kind: newKind } as NumberPropertyPayload;
      case 'integer':
        return { kind: newKind } as IntegerPropertyPayload;
      case 'ref':
        return { kind: newKind, ref: selectedKey } as RefPropertyPayload;
    }
  }
};

type Props = {
  isArray: boolean;
  kind: FormDialogPropertyKind;
  payload: FormDialogPropertyPayload;
  onChange: (kind: FormDialogPropertyKind, payload?: FormDialogPropertyPayload) => void;
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
        { key: 'integer', text: formatMessage('integer'), selected: kind === 'integer', data: 'integer' },
        {
          key: 'string',
          text: formatMessage('any string'),
          selected: kind === 'string' && !(payload as StringPropertyPayload).format,
          data: 'string',
        },
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
        key: 'divider1',
        itemType: DropdownMenuItemType.Divider,
      } as IDropdownOption,
      {
        key: 'header1',
        itemType: DropdownMenuItemType.Header,
        text: formatMessage('Define by value type'),
      } as IDropdownOption,
      ...dynamicOptions,
    ];
  }, [isEnumList, dynamicOptions]);

  const selectedKey = React.useMemo(() => options.find((o) => o.selected).key, [options]);

  const change = React.useCallback(
    (_: React.FormEvent<HTMLDivElement>, option: IDropdownOption) => {
      const newKind = option.data as FormDialogPropertyKind;
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
