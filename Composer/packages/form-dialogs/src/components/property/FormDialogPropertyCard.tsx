// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { FocusZone, FocusZoneDirection } from 'office-ui-fabric-react/lib/FocusZone';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import {
  ArrayPropertyPayload,
  FormDialogProperty,
  FormDialogPropertyPayload,
  NumberPropertyPayload,
  SchemaPropertyKind,
  StringPropertyPayload,
} from 'src/atoms/types';
import { FieldLabel } from 'src/components/common/FieldLabel';
import { AdvancedOptions } from 'src/components/property/AdvancedOptions';
import { NumberPropertyContent } from 'src/components/property/NumberPropertyContent';
import { PropertyTypeSelector } from 'src/components/property/PropertyTypeSelector';
import { StringPropertyContent } from 'src/components/property/StringPropertyContent';

const ContentRoot = styled.div(({ isValid, isDragging }: { isValid: boolean; isDragging: boolean }) => ({
  width: 720,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  background: FluentTheme.palette.white,
  padding: 24,
  boxShadow: isDragging
    ? '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
    : '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1)',
  '&:hover': {
    boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  },
  '& > *:not(:last-of-type)': {
    marginBottom: 16,
  },
  '&::after': {
    display: isValid ? 'none' : 'block',
    content: '""',
    position: 'absolute',
    left: -1,
    top: -1,
    right: -1,
    bottom: -1,
    pointerEvents: 'none',
    border: `2px solid ${FluentTheme.palette.red}`,
    zIndex: 1,
  },
}));

const renderProperty = (
  kind: SchemaPropertyKind,
  payload: FormDialogPropertyPayload,
  onChangePayload: (payload: FormDialogPropertyPayload) => void
): React.ReactNode => {
  switch (kind) {
    case 'string':
      return <StringPropertyContent payload={payload as StringPropertyPayload} onChangePayload={onChangePayload} />;
    case 'number':
      return <NumberPropertyContent payload={payload as NumberPropertyPayload} onChangePayload={onChangePayload} />;
    case 'ref':
      return null;
    default:
      throw new Error(`${kind} is not a known property to render!`);
  }
};

export type FormDialogPropertyCardProps = {
  valid: boolean;
  property: FormDialogProperty;
  onChangeKind: (kind: SchemaPropertyKind, payload: FormDialogPropertyPayload) => void;
  onChangeName: (name: string) => void;
  onChangeRequired: (required: boolean) => void;
  onChangeArray: (isArray: boolean) => void;
  onChangePayload: (payload: FormDialogPropertyPayload) => void;
  onChangeExamples: (examples: readonly string[]) => void;
  draggable?: {
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
  };
};

export const FormDialogPropertyCard = React.memo((props: FormDialogPropertyCardProps) => {
  const {
    valid,
    property,
    onChangeKind,
    onChangeName,
    onChangePayload,
    onChangeRequired,
    onChangeArray,
    onChangeExamples,
    draggable,
  } = props;

  const { array, kind, name, payload, required } = property;

  const propertyNameTooltipId = useId('propertyName');
  const propertyRequiredTooltipId = useId('propertyRequired');
  const propertyArrayTooltipId = useId('propertyArray');

  const changeRequired = React.useCallback(
    (_: React.FormEvent<HTMLElement | HTMLInputElement>, checked: boolean) => {
      onChangeRequired(checked);
    },
    [onChangeRequired]
  );

  const changeArray = React.useCallback(
    (_: React.FormEvent<HTMLElement | HTMLInputElement>, checked: boolean) => {
      onChangeArray(checked);
    },
    [onChangeArray]
  );

  const changeName = React.useCallback(
    (_: React.FormEvent<HTMLElement | HTMLInputElement>, value: string) => {
      onChangeName(value);
    },
    [onChangeName]
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
    <FocusZone isCircularNavigation direction={FocusZoneDirection.vertical}>
      <ContentRoot
        data-is-focusable
        isDragging={draggable?.snapshot.isDragging}
        isValid={valid}
        {...draggable?.provided.draggableProps}
        {...draggable?.provided.dragHandleProps}
        ref={draggable?.provided.innerRef}
      >
        <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
          <TextField
            aria-describedby={propertyNameTooltipId}
            autoComplete="off"
            label={formatMessage('Property name')}
            placeholder={formatMessage('Name of the property')}
            styles={{ root: { flex: 1 } }}
            value={name}
            onChange={changeName}
            onRenderLabel={onRenderLabel(formatMessage('Property name help text'), propertyNameTooltipId)}
          />
          <Stack
            horizontal
            verticalFill
            styles={{ root: { flex: 1, marginTop: 28 } }}
            tokens={{ childrenGap: 24 }}
            verticalAlign="center"
          >
            <Checkbox
              aria-describedby={propertyRequiredTooltipId}
              checked={required}
              label={formatMessage('Required')}
              onChange={changeRequired}
              onRenderLabel={onRenderLabel(formatMessage('Property required help text'), propertyRequiredTooltipId)}
            />
            <Checkbox
              aria-describedby={propertyArrayTooltipId}
              checked={array}
              label={formatMessage('Accepts multiple values')}
              onChange={changeArray}
              onRenderLabel={onRenderLabel(formatMessage('Property array help text'), propertyArrayTooltipId)}
            />
          </Stack>
        </Stack>
        <Stack horizontal tokens={{ childrenGap: 16 }}>
          <Stack styles={{ root: { flex: 1 } }}>
            <PropertyTypeSelector
              data-is-focusable
              isArray={kind === 'array'}
              kind={kind === 'array' ? (payload as ArrayPropertyPayload).items.kind : kind}
              payload={payload}
              onChange={onChangeKind}
            />
          </Stack>
          <Stack styles={{ root: { flex: 1 } }}>
            {kind === 'number' ? renderProperty(kind, payload, onChangePayload) : null}
          </Stack>
        </Stack>
        {kind !== 'number' ? renderProperty(kind, payload, onChangePayload) : null}
        {kind === 'string' && !(payload as StringPropertyPayload).format ? (
          <AdvancedOptions property={property} onChangeExamples={onChangeExamples} onChangePayload={onChangePayload} />
        ) : null}
      </ContentRoot>
    </FocusZone>
  );
});
