// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';

import { PropertyRequiredKind } from '../../atoms/types';
import { jsPropertyListClassName } from '../../utils/constants';
import { HelpTooltip } from '../common/HelpTooltip';

import { PropertyListItem } from './PropertyListItem';

const Root = styled(Stack)({
  position: 'relative',
});

const List = styled.div(({ isDraggingOver }: { isDraggingOver: boolean }) => ({
  margin: '0 0 24px 0',
  backgroundColor: isDraggingOver ? NeutralColors.gray40 : 'transparent',
}));

const Header = styled(Stack)({
  height: 56,
  width: 740,
});

const HeaderText = styled(Text)({
  color: NeutralColors.gray130,
  fontWeight: 600,
});

const EmptyMessage = styled(Stack)({
  height: 48,
  width: 768,
});

type Props = {
  kind: PropertyRequiredKind;
  propertyIds: string[];
};

const InternalPropertyList = React.memo((props: Props) => (
  <div className={jsPropertyListClassName}>
    {props.propertyIds.length ? (
      props.propertyIds.map((propertyId, index) => (
        <PropertyListItem key={propertyId} index={index} propertyId={propertyId} />
      ))
    ) : (
      <EmptyMessage horizontal horizontalAlign="center" verticalAlign="center">
        <Text styles={{ root: { color: NeutralColors.gray80 } }} variant="medium">
          {props.kind === 'required'
            ? formatMessage('There are no required properties.')
            : formatMessage('There are no optional properties.')}
        </Text>
      </EmptyMessage>
    )}
  </div>
));

export const PropertyList = (props: Props) => {
  const { kind } = props;

  return (
    <Root horizontalAlign="center">
      <Header horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
        <HeaderText>
          {kind === 'required' ? formatMessage('Required properties') : formatMessage('Optional properties')}
        </HeaderText>
        <HelpTooltip
          helpMessage={
            kind === 'required'
              ? formatMessage(
                  'Required properties are properties that your bot will ask the user to provide. The user must provide values for all required properties.'
                )
              : formatMessage('Optional properties are properties the bot accepts if given but does not ask for.')
          }
          tooltipId={`${kind}-tooltip`}
        />
      </Header>
      <Droppable direction="vertical" droppableId={kind}>
        {(provided, { isDraggingOver }) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <List isDraggingOver={isDraggingOver}>
              <InternalPropertyList {...props} />
              {provided.placeholder}
            </List>
          </div>
        )}
      </Droppable>
    </Root>
  );
};
