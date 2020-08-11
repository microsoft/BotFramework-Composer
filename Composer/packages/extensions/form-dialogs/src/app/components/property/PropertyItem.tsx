// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IconButton } from '@fluentui/react/lib/Button';
import { Icon, IIconProps, IIconStyles } from '@fluentui/react/lib/Icon';
import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { DirectionalHint, TooltipHost } from '@fluentui/react/lib/Tooltip';
import { classNamesFunction } from '@fluentui/react/lib/Utilities';
import formatMessage from 'format-message';
import { Observer } from 'mobx-react';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { AdvancedOptions } from 'src/app/components/property/AdvancedOptions';
import { ArrayPropertyContent } from 'src/app/components/property/ArrayPropertyContent';
import { NumberPropertyContent } from 'src/app/components/property/NumberPropertyContent';
import { PropertyTypeSelector } from 'src/app/components/property/PropertyTypeSelector';
import { RefPropertyContent } from 'src/app/components/property/RefPropertyContent';
import { StringPropertyContent } from 'src/app/components/property/StringPropertyContent';
import {
  ArrayPropertyPayload,
  NumberPropertyPayload,
  PropertyPayload,
  RefPropertyPayload,
  SchemaPropertyKind,
  SchemaPropertyStore,
  StringPropertyPayload,
} from 'src/app/stores/schemaPropertyStore';
import { getScopedTheme, getStylistV2 } from 'src/app/theme/stylist';
import { generateId } from 'src/app/utils/base';
import { hexToRBGA } from 'src/app/utils/color';

const { styleComponent, styleDiv } = getStylistV2('PropertyItem');
const scopedTheme = getScopedTheme('PropertyItem');

const Root = styleDiv(
  'Root',
  (theme, cssVars) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: cssVars.boxShadow,
    margin: '0 0 24px 0',
    background: theme.backgroundColor,
    transition: 'box-shadow 250ms ease',
    padding: '8px 16px 0 16px',
    $nest: {
      '&>*': {
        marginBottom: 8,
      },
      '&:first-child': {
        marginTop: 8,
      },
      '&::after': {
        display: cssVars.validationDisplay,
        content: '""',
        position: 'absolute',
        left: -1,
        top: -1,
        right: -1,
        bottom: -1,
        pointerEvents: 'none',
        border: `2px solid ${theme.errorColor}`,
        zIndex: 1,
      },
    },
  }),
  {
    cssVars: { boxShadow: '', validationDisplay: '' },
    cssVarsSetter: ({ dragging, isValid }: { dragging: boolean; isValid: boolean }, theme) => ({
      boxShadow: dragging
        ? `0 16px 24px 2px ${hexToRBGA(theme.baseShadowColor, 0.14)}, 0 6px 30px 5px ${hexToRBGA(
            theme.baseShadowColor,
            0.12
          )}, 0 8px 10px -5px ${hexToRBGA(theme.baseShadowColor, 0.2)}`
        : `0 4px 5px 0 ${hexToRBGA(theme.baseShadowColor, 0.14)}, 0 1px 10px 0 ${hexToRBGA(
            theme.baseShadowColor,
            0.12
          )}, 0 2px 4px -1px ${hexToRBGA(theme.baseShadowColor, 0.2)}`,
      validationDisplay: isValid ? 'none' : 'block',
    }),
  }
);

const Footer = styleComponent(Stack)('Footer', (theme) => ({
  paddingTop: 8,
  borderTop: `1px solid ${theme.borderColor}`,
}));

const DragHandleContainer = styleComponent(Stack)('DragHandleContainer', {});

const errorIconStyles = classNamesFunction<IIconProps, IIconStyles>()({
  root: {
    color: scopedTheme.errorColor,
    cursor: 'default',
  },
});

const DragHandle = styleDiv('DragHandle', (theme) => ({
  width: 60,
  height: 24,
  display: 'flex',
  verticalAlign: 'center',
  justifyContent: 'center',
  color: theme.handleColor,
}));

export type PropertyItemProps = {
  index: number;
  property: SchemaPropertyStore;
  onChangePropertyKind: (id: string, kind: SchemaPropertyKind) => void;
  onChangeRequired: (id: string, required: boolean) => void;
  onChangeName: (id: string, name: string) => void;
  onChangePayload: (id: string, payload: PropertyPayload) => void;
  onChangeExamples: (id: string, examples: readonly string[]) => void;
  onRemoveProperty: (id: string) => void;
  onDuplicateProperty: (id: string) => void;
  onChangeRef: (id: string, data: { key: string; item: string }) => void;
};

export const PropertyItem = (props: PropertyItemProps) => {
  const {
    index,
    property,
    onChangePropertyKind,
    onChangeRequired,
    onChangeName,
    onChangePayload,
    onRemoveProperty,
    onDuplicateProperty,
    onChangeExamples,
  } = props;

  const propertyId = property.id;

  const tooltipId = React.useRef<string>(`tooltip-${generateId()}`);
  const changePayload = React.useCallback(
    (payload: PropertyPayload) => {
      onChangePayload(propertyId, payload);
    },
    [propertyId, onChangePayload]
  );

  const duplicateProperty = React.useCallback(() => {
    onDuplicateProperty(propertyId);
  }, [propertyId, onDuplicateProperty]);

  const removeProperty = React.useCallback(() => {
    onRemoveProperty(propertyId);
  }, [propertyId, onRemoveProperty]);

  const changeExamples = React.useCallback(
    (examples: readonly string[]) => {
      onChangeExamples(propertyId, examples);
    },
    [propertyId, onChangeExamples]
  );

  const changePropertyKind = React.useCallback(
    (kind: SchemaPropertyKind) => {
      onChangePropertyKind(propertyId, kind);
    },
    [propertyId, onChangePropertyKind]
  );

  const changeRequired = React.useCallback(
    (_: React.MouseEvent<HTMLElement, MouseEvent>, checked: boolean) => {
      onChangeRequired(propertyId, checked);
    },
    [propertyId, onChangeRequired]
  );

  return (
    <Draggable draggableId={propertyId} index={index}>
      {(provided, snapshot) => (
        <Observer>
          {() => (
            <Root
              customProps={{ dragging: snapshot.isDragging, isValid: property.isValid }}
              {...provided.draggableProps}
              originalRef={provided.innerRef}
            >
              <DragHandleContainer horizontalAlign="center" verticalAlign="center">
                <DragHandle {...provided.dragHandleProps}>
                  <Icon iconName="GripperDotsVertical" styles={{ root: { transform: 'rotate(90deg)' } }} />
                </DragHandle>
              </DragHandleContainer>
              <Stack horizontal tokens={{ childrenGap: 8 }}>
                <TextField
                  required
                  label={formatMessage('Property name')}
                  placeholder={formatMessage('Name of the property')}
                  styles={{ root: { flex: 1 } }}
                  value={property.name}
                  onChange={(_e, value) => onChangeName(propertyId, value)}
                />
                <Stack.Item styles={{ root: { flex: 1 } }}>
                  <PropertyTypeSelector kind={property.kind} onChange={changePropertyKind} />
                </Stack.Item>
              </Stack>
              {renderProperty(property, changePayload)}
              {property.kind !== 'ref' ? (
                <AdvancedOptions
                  property={property}
                  onChangeExamples={changeExamples}
                  onChangePayload={changePayload}
                />
              ) : null}
              <Footer horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
                {!property.isValid && (
                  <TooltipHost
                    content={formatMessage('Property has error(s), please fix the error(s) for this property.')}
                    directionalHint={DirectionalHint.bottomCenter}
                    id={tooltipId.current}
                  >
                    <Icon aria-describedby={tooltipId.current} iconName="ErrorBadge" styles={errorIconStyles} />
                  </TooltipHost>
                )}
                <Stack
                  horizontal
                  horizontalAlign="end"
                  styles={{ root: { marginLeft: 'auto', flex: 1 } }}
                  tokens={{ childrenGap: 8 }}
                >
                  <IconButton
                    iconProps={{ iconName: 'Copy', style: { fontSize: 20 } }}
                    title={formatMessage('Duplicate')}
                    onClick={duplicateProperty}
                  />
                  <IconButton
                    iconProps={{ iconName: 'Delete', style: { fontSize: 20 } }}
                    title={formatMessage('Delete')}
                    onClick={removeProperty}
                  />
                  <Toggle
                    inlineLabel
                    checked={property.required}
                    label={formatMessage('Required')}
                    styles={{ root: { margin: '0' } }}
                    onChange={changeRequired}
                  />
                </Stack>
              </Footer>
            </Root>
          )}
        </Observer>
      )}
    </Draggable>
  );
};

const renderProperty = (property: SchemaPropertyStore, onChangePayload: (payload: PropertyPayload) => void) => {
  const { kind, payload } = property;
  switch (kind) {
    case 'string':
      return <StringPropertyContent payload={payload as StringPropertyPayload} onChangePayload={onChangePayload} />;
    case 'number':
      return <NumberPropertyContent payload={payload as NumberPropertyPayload} onChangePayload={onChangePayload} />;
    case 'array':
      return <ArrayPropertyContent payload={payload as ArrayPropertyPayload} onChangePayload={onChangePayload} />;
    case 'ref':
      return <RefPropertyContent payload={payload as RefPropertyPayload} onChangePayload={onChangePayload} />;
    default:
      throw new Error(`${kind} is not a known property to render!`);
  }
};
