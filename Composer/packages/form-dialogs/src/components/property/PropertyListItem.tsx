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
import { FormDialogProperty, FormDialogPropertyPayload, FormDialogPropertyKind } from 'src/atoms/types';
import { getPropertyTypeDisplayName } from 'src/atoms/utils';
import { FormDialogPropertyCard } from 'src/components/property/FormDialogPropertyCard';
import { RequiredPriorityIndicator } from 'src/components/property/RequiredPriorityIndicator';

const ItemRoot = styled.div(({ isDragging }: { isDragging: boolean }) => ({
  boxShadow: isDragging ? '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)' : null,
}));

const ItemContentRoot = styled(Stack)({
  width: 720,
  height: 48,
  padding: '0 24px',
  position: 'relative',
  cursor: 'pointer',
  boxSizing: 'content-box',
  background: FluentTheme.palette.white,
  transition: 'box-shadow 0.3s cubic-bezier(.25,.8,.25,1)',
  marginBottom: 1,
});

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
  width: 100,
});

const ArrayText = styled(Text)({
  display: 'inline-block',
  width: 130,
});

const ErrorIcon = styled(Stack.Item)({
  width: 20,
});

type ContentProps = {
  valid: boolean;
  property: FormDialogProperty;
  dragHandleProps: DraggableProvidedDragHandleProps;
  onActivateItem: (propertyId: string) => void;
};
const PropertyListItemContent = React.memo((props: ContentProps) => {
  const { property, valid, dragHandleProps, onActivateItem } = props;

  const tooltipId = useId('PropertyListItemContent');

  const activateItem = React.useCallback(() => {
    onActivateItem(property.id);
  }, [onActivateItem, property.id]);

  const keyUp = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        activateItem();
      }
    },
    [activateItem]
  );

  const propertyTypeDisplayName = React.useMemo(() => getPropertyTypeDisplayName(property), [property]);

  return (
    <ItemContentRoot
      horizontal
      horizontalAlign="stretch"
      tokens={{ childrenGap: 8 }}
      verticalAlign="center"
      onClick={activateItem}
      onKeyUp={keyUp}
    >
      <Icon {...dragHandleProps} iconName="GripperDotsVertical" />
      <ErrorIcon>
        <TooltipHost
          content={formatMessage('Property has error(s), please fix the error(s) for this property.')}
          directionalHint={DirectionalHint.bottomCenter}
          id={tooltipId}
        >
          {!valid && <Icon iconName="WarningSolid" styles={{ root: { color: FluentTheme.palette.red } }} />}
        </TooltipHost>
      </ErrorIcon>
      <PropertyName>{property.name || formatMessage('[no name]')}</PropertyName>
      <PropertyType title={propertyTypeDisplayName} variant="small">
        {propertyTypeDisplayName}
      </PropertyType>
      <ArrayText variant="smallPlus">{property.array ? formatMessage('Accepts multiple values') : ''}</ArrayText>
      <RequiredPriorityIndicator propertyId={property.id} required={property.required} />
    </ItemContentRoot>
  );
});

type Props = {
  index: number;
  propertyId: string;
};

export const PropertyListItem = React.memo((props: Props) => {
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
    (kind: FormDialogPropertyKind, payload: FormDialogPropertyPayload) => {
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
      {(provided, { isDragging }) => (
        <div data-is-focusable {...provided.draggableProps} ref={provided.innerRef}>
          <ItemRoot isDragging={isDragging}>
            {propertyId === activePropertyId ? (
              <FormDialogPropertyCard
                dragHandleProps={provided.dragHandleProps}
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
                property={property}
                valid={valid}
                onActivateItem={onActivateItem}
              />
            )}
          </ItemRoot>
        </div>
      )}
    </Draggable>
  );
});
