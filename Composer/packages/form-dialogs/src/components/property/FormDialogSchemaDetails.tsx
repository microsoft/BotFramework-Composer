// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import styled from '@emotion/styled';
import { NeutralColors } from '@uifabric/fluent-theme';
import * as React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';
import { formDialogSchemaAtom } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { PropertyRequiredKind } from 'src/atoms/types';
import { PropertyList } from 'src/components/property/PropertyList';
import { Lifetime } from 'src/utils/base';
import { jsPropertyListClassName } from 'src/utils/constants';

const Root = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

const Separator = styled.div({
  background: NeutralColors.gray60,
  height: 1,
  width: 'calc(100% - 48px)',
  margin: '4px 24px',
});

export const FormDialogSchemaDetails = () => {
  const { optionalPropertyIds, requiredPropertyIds } = useRecoilValue(formDialogSchemaAtom);
  const { moveProperty, activatePropertyId } = useHandlers();
  const containerRef = React.useRef<HTMLDivElement>();
  const dragEventRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    const lifetime = new Lifetime();

    const clickOutsideLists = (e: MouseEvent) => {
      const { x, y } = e;
      const elms = Array.prototype.slice.call(
        containerRef.current.querySelectorAll(`.${jsPropertyListClassName}`) || []
      ) as HTMLDivElement[];
      if (
        !dragEventRef.current &&
        !elms.some((elm) => {
          const { left, right, top, bottom } = elm.getBoundingClientRect();
          return x <= right && x >= left && y <= bottom && y >= top;
        })
      ) {
        activatePropertyId({ id: '' });
      }
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('click', clickOutsideLists);
      lifetime.add(() => {
        containerRef.current.removeEventListener('click', clickOutsideLists);
      });
    }

    return () => lifetime.dispose();
  }, []);

  const dragStart = React.useCallback(() => {
    dragEventRef.current = true;
  }, []);

  const dragEnd = React.useCallback(
    (result: DropResult) => {
      dragEventRef.current = false;

      const { source, destination, draggableId } = result;

      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
      }

      moveProperty({
        id: draggableId,
        source: source.droppableId as PropertyRequiredKind,
        destination: destination.droppableId as PropertyRequiredKind,
        fromIndex: source.index,
        toIndex: destination.index,
      });
    },
    [moveProperty]
  );

  return (
    <Root ref={containerRef}>
      <DragDropContext onDragEnd={dragEnd} onDragStart={dragStart}>
        <PropertyList kind="required" propertyIds={requiredPropertyIds} />
        <Separator />
        <PropertyList kind="optional" propertyIds={optionalPropertyIds} />
      </DragDropContext>
    </Root>
  );
};
