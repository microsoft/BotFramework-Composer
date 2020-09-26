// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { DirectionalHint, TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import * as React from 'react';
import { Draggable, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';
import { activePropertyIdAtom, formDialogPropertyAtom, formDialogPropertyValidSelector } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { FormDialogProperty, FormDialogPropertyPayload, SchemaPropertyKind } from 'src/atoms/types';
import { getPropertyTypeDisplayName } from 'src/atoms/utils';
import { FormDialogPropertyCard } from 'src/components/property/FormDialogPropertyCard';

const ItemContentRoot = styled(Stack)(({ isDragging }: { isDragging: boolean }) => ({
  width: 720,
  height: 48,
  padding: '0 24px',
  position: 'relative',
  cursor: 'pointer',
  boxSizing: 'content-box',
  background: FluentTheme.palette.white,
  boxShadow: isDragging ? '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)' : null,
  transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1)',
  marginBottom: 1,
}));

const OneLinerText = styled(Text)({
  display: 'inline-block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const PropertyName = styled(OneLinerText)({
  flex: 1,
});

const PropertyType = styled(OneLinerText)({
  color: FluentTheme.palette.themePrimary,
  textTransform: 'uppercase',
  width: 130,
});

const RequiredIndicator = styled(Text)(({ required }: { required: boolean }) => ({
  display: 'inline-block',
  width: 60,
  color: required ? FluentTheme.palette.red : 'unset',
}));

const ArrayText = styled(Text)({
  display: 'inline-block',
  width: 130,
});

const ErrorIcon = styled(Stack.Item)({
  width: 32,
});

type ContentProps = {
  valid: boolean;
  property: FormDialogProperty;
  isDragging: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps;
  onActivateItem: (propertyId: string) => void;
};
const PropertyListItemContent = React.memo((props: ContentProps) => {
  const { property, valid, isDragging, dragHandleProps, onActivateItem } = props;

  const tooltipId = useId('PropertyListItemContent');

  const activateItem = React.useCallback(() => {
    onActivateItem(property.id);
  }, [onActivateItem, property.id]);

  const propertyTypeDisplayName = React.useMemo(() => getPropertyTypeDisplayName(property), [property]);

  return (
    <ItemContentRoot
      horizontal
      horizontalAlign="stretch"
      isDragging={isDragging}
      tokens={{ childrenGap: 8 }}
      verticalAlign="center"
      onClick={activateItem}
    >
      <Icon
        {...dragHandleProps}
        iconName="GripperDotsVertical"
        styles={{ root: { color: FluentTheme.palette.themeDark } }}
      />
      <PropertyType title={propertyTypeDisplayName} variant="xSmall">
        {propertyTypeDisplayName}
      </PropertyType>
      <PropertyName>{property.name || formatMessage('[no name]')}</PropertyName>
      <RequiredIndicator required={property.required} variant="smallPlus">
        {property.required ? formatMessage('Required') : formatMessage('Optional')}
      </RequiredIndicator>
      <ArrayText variant="smallPlus">{property.array ? formatMessage('Accepts multiple values') : ''}</ArrayText>
      <ErrorIcon>
        <TooltipHost
          content={formatMessage('Property has error(s), please fix the error(s) for this property.')}
          directionalHint={DirectionalHint.bottomCenter}
          id={tooltipId}
        >
          {!valid && <Icon iconName="WarningSolid" styles={{ root: { color: FluentTheme.palette.red } }} />}
        </TooltipHost>
      </ErrorIcon>
    </ItemContentRoot>
  );
});

type Props = {
  index: number;
  propertyId: string;
};

export const PropertyListItem = (props: Props) => {
  const { propertyId, index } = props;

  const activePropertyId = useRecoilValue(activePropertyIdAtom);
  const property = useRecoilValue(formDialogPropertyAtom(propertyId));
  const valid = useRecoilValue(formDialogPropertyValidSelector(propertyId));

  const {
    changePropertyKind,
    changePropertyName,
    changePropertyPayload,
    changePropertyArray,
    activatePropertyId,
    removeProperty,
    duplicateProperty,
  } = useHandlers();

  const onChangePropertyKind = React.useCallback(
    (kind: SchemaPropertyKind, payload: FormDialogPropertyPayload) => {
      changePropertyKind({ id: propertyId, kind, payload });
    },
    [changePropertyKind, propertyId]
  );

  const onChangePropertyName = React.useCallback(
    (name: string) => {
      changePropertyName({ id: propertyId, name });
    },
    [changePropertyName, propertyId]
  );

  const onChangePayload = React.useCallback(
    (payload: FormDialogPropertyPayload) => {
      changePropertyPayload({ id: propertyId, payload });
    },
    [changePropertyPayload, propertyId]
  );

  const onChangeArray = React.useCallback(
    (isArray: boolean) => {
      changePropertyArray({ id: propertyId, isArray });
    },
    [changePropertyArray]
  );

  const onActivateItem = React.useCallback(
    (propertyId: string) => {
      activatePropertyId({ id: propertyId });
    },
    [activatePropertyId]
  );

  const onRemove = React.useCallback(() => {
    if (confirm(formatMessage('Are you sure you want to remove "{propertyName}"?', { propertyName: property.name }))) {
      removeProperty({ id: propertyId });
    }
  }, [removeProperty, propertyId]);

  const onDuplicate = React.useCallback(() => {
    duplicateProperty({ id: propertyId });
  }, [duplicateProperty, propertyId]);

  return (
    <Draggable draggableId={propertyId} index={index}>
      {(provided, snapshot) => (
        <div data-is-focusable {...provided.draggableProps} ref={provided.innerRef}>
          {propertyId === activePropertyId ? (
            <FormDialogPropertyCard
              dragHandleProps={provided.dragHandleProps}
              index={index}
              isDragging={snapshot.isDragging}
              property={property}
              valid={valid}
              onActivateItem={onActivateItem}
              onChangeArray={onChangeArray}
              onChangeKind={onChangePropertyKind}
              onChangeName={onChangePropertyName}
              onChangePayload={onChangePayload}
              onDuplicate={onDuplicate}
              onRemove={onRemove}
            />
          ) : (
            <PropertyListItemContent
              dragHandleProps={provided.dragHandleProps}
              isDragging={snapshot.isDragging}
              property={property}
              valid={valid}
              onActivateItem={onActivateItem}
            />
          )}
        </div>
      )}
    </Draggable>
  );
};
