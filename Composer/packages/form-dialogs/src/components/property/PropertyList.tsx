// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { PropertyListItem } from 'src/components/property/PropertyListItem';
import { jsPropertyListClassName } from 'src/utils/constants';

const Root = styled(Stack)({
  position: 'relative',
});

const InternalListRoot = styled(Stack)(({ isDraggingOver }: { isDraggingOver: boolean }) => ({
  margin: '24px 0',
  backgroundColor: isDraggingOver ? NeutralColors.gray40 : 'transparent',
}));

const Header = styled(Text)({
  position: 'absolute',
  left: 24,
  top: 24,
  color: NeutralColors.gray130,
  fontWeight: 600,
});

const EmptyMessage = styled(Stack)({
  height: 48,
  width: 768,
});

type Props = {
  kind: 'required' | 'optional';
  propertyIds: string[];
};

const InternalPropertyList = React.memo((props: Props & { isDraggingOver: boolean }) => (
  <InternalListRoot className={jsPropertyListClassName} isDraggingOver={props.isDraggingOver}>
    {props.propertyIds.length ? (
      props.propertyIds.map((propertyId, index) => (
        <PropertyListItem key={propertyId} index={index} propertyId={propertyId} />
      ))
    ) : (
      <EmptyMessage horizontal horizontalAlign="center" verticalAlign="center">
        <Text styles={{ root: { color: NeutralColors.gray80 } }} variant="medium">
          {formatMessage('There are no {kind} properties.', {
            kind: props.kind === 'required' ? formatMessage('required') : formatMessage('optional'),
          })}
        </Text>
      </EmptyMessage>
    )}
  </InternalListRoot>
));

export const PropertyList = (props: Props) => {
  const { kind } = props;

  return (
    <Root>
      <Header>
        {kind === 'required' ? formatMessage('Required properties') : formatMessage('Optional properties')}
      </Header>
      <Droppable direction="vertical" droppableId={kind}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              width: '100%',
            }}
            {...provided.droppableProps}
          >
            <InternalPropertyList {...props} isDraggingOver={snapshot.isDraggingOver} />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Root>
  );
};
