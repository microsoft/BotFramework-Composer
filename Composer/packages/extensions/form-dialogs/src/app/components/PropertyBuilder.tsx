// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from '@fluentui/react/lib/Stack';
import { Observer } from 'mobx-react';
import * as React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { PropertyItem } from 'src/app/components/property/PropertyItem';
import { Context } from 'src/app/context/Context';
import { PropertyPayload, SchemaPropertyKind } from 'src/app/stores/schemaPropertyStore';
import { SchemaStore } from 'src/app/stores/schemaStore';
import { getStylistV2 } from 'src/app/theme/stylist';

const { styleComponent } = getStylistV2('VisualEditor');

const Root = styleComponent(Stack)('Root', { width: '600px' });

type Props = {
  schema: SchemaStore;
};

export const PropertyBuilder = (props: Props) => {
  const { dispatcher } = React.useContext(Context);
  const { schema } = props;

  const changePropertyKind = React.useCallback(
    (id: string, kind: SchemaPropertyKind) => {
      dispatcher.dispatch('changePropertyKind', { id, kind });
    },
    [dispatcher]
  );

  const changePropertyRequired = React.useCallback(
    (id: string, required: boolean) => {
      dispatcher.dispatch('changePropertyRequired', { id, required });
    },
    [dispatcher]
  );

  const changePropertyName = React.useCallback(
    (id: string, name: string) => {
      dispatcher.dispatch('changePropertyName', { id, name });
    },
    [dispatcher]
  );

  const changePropertyPayload = React.useCallback(
    (id: string, payload: PropertyPayload) => {
      dispatcher.dispatch('changePropertyPayload', { id, payload });
    },
    [dispatcher]
  );

  const removeProperty = React.useCallback(
    (id: string) => {
      dispatcher.dispatch('removeProperty', { id });
    },
    [dispatcher]
  );

  const duplicateProperty = React.useCallback(
    (id: string) => {
      dispatcher.dispatch('duplicateProperty', { id });
    },
    [dispatcher]
  );

  const changeRef = React.useCallback(
    (id: string, { key, item }: { key: string; item: string }) => {
      dispatcher.dispatch('changeRef', { id, ref: `template:${key}.schema#/${item}` });
    },
    [dispatcher]
  );

  const changeExamples = React.useCallback(
    (id: string, examples: readonly string[]) => {
      dispatcher.dispatch('changePropertyExamples', { id, examples });
    },
    [dispatcher]
  );

  const dragEnd = React.useCallback(
    (result: DropResult) => {
      const { source, destination } = result;

      if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
        return;
      }

      dispatcher.dispatch('moveProperty', {
        fromIndex: source.index,
        toIndex: destination.index,
      });
    },
    [dispatcher]
  );

  return (
    <Root verticalFill>
      <DragDropContext onDragEnd={dragEnd}>
        <Droppable direction="vertical" droppableId="builder-area">
          {(provided) => (
            <Observer>
              {() => (
                <div
                  ref={provided.innerRef}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                  {...provided.droppableProps}
                >
                  {schema.properties.map((property, index) => (
                    <PropertyItem
                      key={property.id}
                      index={index}
                      property={property}
                      onChangeExamples={changeExamples}
                      onChangeName={changePropertyName}
                      onChangePayload={changePropertyPayload}
                      onChangePropertyKind={changePropertyKind}
                      onChangeRef={changeRef}
                      onChangeRequired={changePropertyRequired}
                      onDuplicateProperty={duplicateProperty}
                      onRemoveProperty={removeProperty}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Observer>
          )}
        </Droppable>
      </DragDropContext>
    </Root>
  );
};
