// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { NeutralColors } from '@uifabric/fluent-theme';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import * as React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';
import { useHandlers } from 'src/atoms/handlers';
import { PropertyList } from 'src/components/property/PropertyList';
import styled from '@emotion/styled';
import { formDialogSchemaAtom } from 'src/atoms/appState';

const Separator = styled.div({
  background: NeutralColors.gray60,
  height: 1,
  width: 'calc(100% - 48px)',
  margin: '4px 24px',
});

export const FormDialogSchemaDetails = () => {
  const { optionalPropertyIds, requiredPropertyIds } = useRecoilValue(formDialogSchemaAtom);
  const { moveProperty } = useHandlers();

  const dragEnd = React.useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;

      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
      }

      moveProperty({
        id: draggableId,
        source: source.droppableId as 'required' | 'optional',
        destination: destination.droppableId as 'required' | 'optional',
        fromIndex: source.index,
        toIndex: destination.index,
      });
    },
    [moveProperty]
  );

  return (
    <Stack grow verticalFill>
      <DragDropContext onDragEnd={dragEnd}>
        <PropertyList kind="required" propertyIds={requiredPropertyIds} />
        <Separator />
        <PropertyList kind="optional" propertyIds={optionalPropertyIds} />
      </DragDropContext>
    </Stack>
  );
};
