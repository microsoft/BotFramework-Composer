// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { CommandBarButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { FocusZone } from 'office-ui-fabric-react/lib/FocusZone';
import { IOverflowSetItemProps, OverflowSet } from 'office-ui-fabric-react/lib/OverflowSet';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import {
  ArrayPropertyPayload,
  FormDialogProperty,
  FormDialogPropertyPayload,
  IntegerPropertyPayload,
  NumberPropertyPayload,
  FormDialogPropertyKind,
  StringPropertyPayload,
} from 'src/atoms/types';
import { FieldLabel } from 'src/components/common/FieldLabel';
import { NumberPropertyContent } from 'src/components/property/NumberPropertyContent';
import { PropertyTypeSelector } from 'src/components/property/PropertyTypeSelector';
import { RequiredPriorityIndicator } from 'src/components/property/RequiredPriorityIndicator';
import { StringPropertyContent } from 'src/components/property/StringPropertyContent';

const ContentRoot = styled.div(({ isValid }: { isValid: boolean }) => ({
  width: 720,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  background: FluentTheme.palette.white,
  padding: '14px 24px 24px 24px',
  transition: 'box-shadow 0.25s cubic-bezier(.25,.8,.25,1)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  margin: '8px 0 10px 0',
  transform: 'scale(1.025)',
  transformOrigin: 'center',
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

const ArrayCheckbox = styled(Checkbox)({
  flex: 1,
  marginTop: 28,
  justifyContent: 'flex-end',
});

const isNumerical = (kind: FormDialogPropertyKind) => kind === 'integer' || kind === 'number';

const renderProperty = (
  kind: FormDialogPropertyKind,
  payload: FormDialogPropertyPayload,
  onChangePayload: (payload: FormDialogPropertyPayload) => void
): React.ReactNode => {
  switch (kind) {
    case 'string':
      return <StringPropertyContent payload={payload as StringPropertyPayload} onChangePayload={onChangePayload} />;
    case 'number':
      return <NumberPropertyContent payload={payload as NumberPropertyPayload} onChangePayload={onChangePayload} />;
    case 'integer':
      return <NumberPropertyContent payload={payload as IntegerPropertyPayload} onChangePayload={onChangePayload} />;
    case 'ref':
      return null;
    default:
      throw new Error(`${kind} is not a known property to render!`);
  }
};

export type FormDialogPropertyCardProps = {
  valid: boolean;
  property: FormDialogProperty;
  dragHandleProps: DraggableProvidedDragHandleProps;
  onChangeKind: (kind: FormDialogPropertyKind, payload: FormDialogPropertyPayload) => void;
  onChangeName: (name: string) => void;
  onChangeArray: (isArray: boolean) => void;
  onChangePayload: (payload: FormDialogPropertyPayload) => void;
  onActivateItem: (propertyId: string) => void;
  onRemove: () => void;
  onDuplicate: () => void;
};

export const FormDialogPropertyCard = React.memo((props: FormDialogPropertyCardProps) => {
  const {
    valid,
    property,
    dragHandleProps,
    onChangeKind,
    onChangeName,
    onChangePayload,
    onChangeArray,
    onActivateItem,
    onRemove,
    onDuplicate,
  } = props;

  const { id: propertyId, array, kind, name, payload, required } = property;

  const rootElmRef = React.useRef<HTMLDivElement>();
  const propertyNameTooltipId = useId('propertyName');
  const propertyArrayTooltipId = useId('propertyArray');

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

  const deactivateItem = React.useCallback(() => {
    onActivateItem('');
  }, [onActivateItem]);

  const onRenderLabel = React.useCallback(
    (helpText: string, tooltipId: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: any, defaultRender?: (props: any) => JSX.Element | null) => (
        <FieldLabel defaultRender={defaultRender(props)} helpText={helpText} tooltipId={tooltipId} />
      ),
    []
  );

  const renderOverflowItem = React.useCallback(
    (item: IOverflowSetItemProps) => <CommandBarButton aria-label={item.name} role="menuitem" onClick={item.onClick} />,
    []
  );

  const renderOverflowButton = React.useCallback(
    (overflowItems: IOverflowSetItemProps[]) => (
      <IconButton
        menuIconProps={{
          iconName: 'MoreVertical',
          style: { color: NeutralColors.gray130, fontSize: 16 },
        }}
        menuProps={{ items: overflowItems }}
        role="menuitem"
      />
    ),
    []
  );

  return (
    <FocusZone>
      <ContentRoot {...dragHandleProps} ref={rootElmRef} isValid={valid}>
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
            horizontalAlign="end"
            styles={{ root: { flex: 1, marginTop: 28 } }}
            tokens={{ childrenGap: 8 }}
            verticalAlign="center"
          >
            <RequiredPriorityIndicator propertyId={propertyId} required={required} />

            <OverflowSet
              aria-label={formatMessage('Property quick actions')}
              overflowItems={[
                {
                  key: 'collapseItem',
                  name: 'Collapse',
                  onClick: deactivateItem,
                },
                { key: 'duplicateItem', name: 'Duplicate', onClick: onDuplicate, iconProps: { iconName: 'Copy' } },
                {
                  key: 'deleteItem',
                  name: 'Delete',
                  onClick: onRemove,
                  iconProps: { iconName: 'Delete' },
                },
              ]}
              role="menubar"
              onRenderItem={renderOverflowItem}
              onRenderOverflowButton={renderOverflowButton}
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
          <Stack horizontal styles={{ root: { flex: 3 } }} tokens={{ childrenGap: 16 }} verticalAlign="center">
            <Stack.Item styles={{ root: { flex: 1 } }}>
              {isNumerical(kind) ? renderProperty(kind, payload, onChangePayload) : null}
            </Stack.Item>
            <ArrayCheckbox
              aria-describedby={propertyArrayTooltipId}
              checked={array}
              label={formatMessage('Accepts multiple values')}
              onChange={changeArray}
              onRenderLabel={onRenderLabel(formatMessage('Property array help text'), propertyArrayTooltipId)}
            />
          </Stack>
        </Stack>
        {!isNumerical(kind) ? renderProperty(kind, payload, onChangePayload) : null}
      </ContentRoot>
    </FocusZone>
  );
});
