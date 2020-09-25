// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';
import { formDialogSchemaAtom } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { DraggablePropertyCard } from 'src/components/property/DraggablePropertyCard';

type InternalPropertyCardListProps = {
  propertyIds: string[];
};

/**
 * An internal list component to prevent unnecessary re-rendering of the cards.
 */
const InternalPropertyCardList = React.memo((props: InternalPropertyCardListProps) => {
  const { propertyIds } = props;

  return (
    <Stack tokens={{ childrenGap: 24, padding: '24px 0' }}>
      {propertyIds.map((propertyId, index) => (
        <DraggablePropertyCard key={propertyId} index={index} propertyId={propertyId} />
      ))}
    </Stack>
  );
});

/**
 * List of property cards that allows for drag&drop.
 */
export const PropertyCardList = () => {
  const { propertyIds } = useRecoilValue(formDialogSchemaAtom);
  const { moveProperty } = useHandlers();

  const dragEnd = React.useCallback(
    (result: DropResult) => {
      const { source, destination } = result;

      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
      }

      moveProperty({
        fromIndex: source.index,
        toIndex: destination.index,
      });
    },
    [moveProperty]
  );

  return (
    <Stack grow verticalFill>
      <DragDropContext onDragEnd={dragEnd}>
        <Droppable direction="vertical" droppableId="list-area">
          {(provided) => (
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
              <InternalPropertyCardList propertyIds={propertyIds} />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Stack>
  );
};
