// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { OpenConfirmModal } from '@bfc/ui-shared';
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

import {
  activePropertyIdAtom,
  formDialogPropertyValidSelector,
  formDialogTemplatesAtom,
  propertyCardDataAtom,
} from '../../atoms/appState';
import { useHandlers } from '../../atoms/handlers';

import { FormDialogPropertyCard } from './FormDialogPropertyCard';
import { RequiredPriorityIndicator } from './RequiredPriorityIndicator';
import { PropertyCardData } from './types';

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
  propertyCardData: PropertyCardData;
  dragHandleProps: DraggableProvidedDragHandleProps;
  onActivateItem: (propertyId: string) => void;
};
const PropertyListItemContent = React.memo((props: ContentProps) => {
  const { propertyCardData, valid, dragHandleProps, onActivateItem } = props;

  const templates = useRecoilValue(formDialogTemplatesAtom);
  const tooltipId = useId('PropertyListItemContent');
  const { title: typeDisplayText, description: typeDisplayTitle } = React.useMemo(
    () => templates.find((template) => template.id === propertyCardData.propertyType).$generator,
    [templates, propertyCardData.propertyType]
  );

  const activateItem = React.useCallback(() => {
    onActivateItem(propertyCardData.id);
  }, [onActivateItem, propertyCardData.id]);

  const keyUp = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter') {
        activateItem();
      }
    },
    [activateItem]
  );

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
      <PropertyName>{propertyCardData.name || formatMessage('[no name]')}</PropertyName>
      <PropertyType title={typeDisplayTitle} variant="small">
        {typeDisplayText}
      </PropertyType>
      <ArrayText variant="smallPlus">
        {propertyCardData.array ? formatMessage('Accepts multiple values') : ''}
      </ArrayText>
      <RequiredPriorityIndicator propertyId={propertyCardData.id} required={propertyCardData.isRequired} />
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
  const propertyCardData = useRecoilValue(propertyCardDataAtom(propertyId));
  const valid = useRecoilValue(formDialogPropertyValidSelector(propertyId));

  const {
    changePropertyType,
    changePropertyName,
    changePropertyCardData,
    changePropertyArray,
    activatePropertyId,
    removeProperty,
    duplicateProperty,
  } = useHandlers();

  const onChangePropertyType = React.useCallback(
    (propertyType: string) => {
      changePropertyType({ id: propertyId, propertyType });
    },
    [changePropertyType, propertyId]
  );

  const onChangePropertyName = React.useCallback(
    (name: string) => {
      changePropertyName({ id: propertyId, name });
    },
    [changePropertyName, propertyId]
  );

  const onChangeData = React.useCallback(
    (data: Record<string, any>) => {
      changePropertyCardData({ id: propertyId, data });
    },
    [changePropertyCardData, propertyId]
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

  const onRemove = React.useCallback(async () => {
    const res = await OpenConfirmModal(
      formatMessage('Delete property?'),
      propertyCardData.name
        ? formatMessage('Are you sure you want to remove "{propertyName}"?', { propertyName: propertyCardData.name })
        : formatMessage('Are you sure you want to remove this property?')
    );
    if (res) {
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
                propertyCardData={propertyCardData}
                valid={valid}
                onActivateItem={onActivateItem}
                onChangeArray={onChangeArray}
                onChangeData={onChangeData}
                onChangeName={onChangePropertyName}
                onChangePropertyType={onChangePropertyType}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
              />
            ) : (
              <PropertyListItemContent
                dragHandleProps={provided.dragHandleProps}
                propertyCardData={propertyCardData}
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
