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
import { useRecoilValue } from 'recoil';

import { formDialogTemplatesAtom } from '../../atoms/appState';
import { nameRegex } from '../../utils/constants';
import { FieldLabel } from '../common/FieldLabel';

import { PropertyCardContent } from './PropertyCardContent';
import { PropertyTypeSelector } from './PropertyTypeSelector';
import { RequiredPriorityIndicator } from './RequiredPriorityIndicator';
import { PropertyCardData } from './types';

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
  marginTop: 28,
  alignSelf: 'flex-end',
});

export type FormDialogPropertyCardProps = {
  valid: boolean;
  propertyCardData: PropertyCardData;
  dragHandleProps: DraggableProvidedDragHandleProps;
  onChangePropertyType: (propertyType: string) => void;
  onChangeName: (name: string) => void;
  onChangeArray: (isArray: boolean) => void;
  onChangeData: (data: Record<string, any>) => void;
  onActivateItem: (propertyId: string) => void;
  onRemove: () => void;
  onDuplicate: () => void;
};

export const FormDialogPropertyCard = React.memo((props: FormDialogPropertyCardProps) => {
  const {
    valid,
    propertyCardData,
    dragHandleProps,
    onChangePropertyType,
    onChangeName,
    onChangeArray,
    onActivateItem,
    onRemove,
    onDuplicate,
    onChangeData,
  } = props;

  const templates = useRecoilValue(formDialogTemplatesAtom);
  const selectedTemplate = React.useMemo(() => templates.find((t) => t.id === propertyCardData.propertyType), [
    propertyCardData,
    templates,
  ]);

  // Indicates if the form in the card has been touched by the user.
  const touchedRef = React.useRef(!!propertyCardData.name);
  const { id: propertyId, name, isArray, isRequired, propertyType, ...cardValues } = propertyCardData;

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
      touchedRef.current = true;
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
          iconName: 'More',
          style: { color: NeutralColors.gray130, fontSize: 16 },
        }}
        menuProps={{ items: overflowItems }}
        role="menuitem"
      />
    ),
    []
  );

  /**
   * Validates the property name only if the user has touched it.
   */
  const validateName = React.useCallback(
    (value: string) =>
      touchedRef.current
        ? !value
          ? formatMessage('Property name is required!')
          : !nameRegex.test(value)
          ? formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.')
          : ''
        : '',
    [touchedRef.current]
  );

  return (
    <FocusZone>
      <ContentRoot {...dragHandleProps} ref={rootElmRef} isValid={!touchedRef.current || valid}>
        <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
          <TextField
            aria-describedby={propertyNameTooltipId}
            autoComplete="off"
            deferredValidationTime={300}
            label={formatMessage('Property name')}
            placeholder={formatMessage('Name of the property')}
            styles={{ root: { flex: 1 } }}
            value={name}
            onChange={changeName}
            onGetErrorMessage={validateName}
            onRenderLabel={onRenderLabel(
              formatMessage(
                `A property is a piece of information that your bot will collect. The property name is the name used in Composer; it is not necessarily the same text that will appear in your bot's messages.`
              ),
              propertyNameTooltipId
            )}
          />
          <Stack
            horizontal
            horizontalAlign="end"
            styles={{ root: { flex: 1, marginTop: 28 } }}
            tokens={{ childrenGap: 16 }}
            verticalAlign="center"
          >
            <RequiredPriorityIndicator propertyId={propertyId} required={isRequired} />

            <OverflowSet
              aria-label={formatMessage('Property actions')}
              overflowItems={[
                {
                  key: 'collapseItem',
                  name: formatMessage('Collapse'),
                  onClick: deactivateItem,
                },
                {
                  key: 'duplicateItem',
                  name: formatMessage('Duplicate'),
                  onClick: onDuplicate,
                  iconProps: { iconName: 'Copy' },
                },
                {
                  key: 'deleteItem',
                  name: formatMessage('Delete'),
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
        <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="center">
          <Stack styles={{ root: { flex: 1 } }} verticalAlign="center">
            <PropertyTypeSelector
              data-is-focusable
              selectedPropertyType={propertyType}
              onChange={onChangePropertyType}
            />
          </Stack>
          <Stack horizontal styles={{ root: { flex: 2 } }} verticalAlign="center">
            <Stack styles={{ root: { flex: 1 } }} verticalAlign="center">
              {selectedTemplate.$generator.array && (
                <ArrayCheckbox
                  aria-describedby={propertyArrayTooltipId}
                  checked={isArray}
                  label={formatMessage('Accepts multiple values')}
                  onChange={changeArray}
                  onRenderLabel={onRenderLabel(
                    formatMessage('This option allows your users to give multiple values for this property.'),
                    `${selectedTemplate.id}-array`
                  )}
                />
              )}
            </Stack>
            <Stack styles={{ root: { flex: 1 } }} verticalAlign="center">
              {selectedTemplate?.$generator.array?.uniqueItems && (
                <ArrayCheckbox
                  defaultChecked={selectedTemplate?.$generator.array?.uniqueItems}
                  disabled={!isArray}
                  label={selectedTemplate?.$generator.array?.uniqueItems.title}
                  onRenderLabel={onRenderLabel(
                    selectedTemplate?.$generator.array?.uniqueItems.description,
                    `${selectedTemplate.id}-unique`
                  )}
                />
              )}
            </Stack>
          </Stack>
        </Stack>
        {selectedTemplate && (
          <PropertyCardContent
            cardValues={cardValues}
            propertyName={propertyCardData.name}
            template={selectedTemplate}
            onDataChange={onChangeData}
          />
        )}
      </ContentRoot>
    </FocusZone>
  );
});
