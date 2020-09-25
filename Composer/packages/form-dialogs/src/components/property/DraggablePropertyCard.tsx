// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';
import { formDialogPropertyAtom, formDialogPropertyValidSelector } from 'src/atoms/appState';
import { useHandlers } from 'src/atoms/handlers';
import { FormDialogPropertyPayload, SchemaPropertyKind } from 'src/atoms/types';
import { FormDialogPropertyCard } from 'src/components/property/FormDialogPropertyCard';

export type DraggablePropertyCardProps = {
  index: number;
  propertyId: string;
};

/**
 * A draggable item in the card list.
 */
export const DraggablePropertyCard = React.memo((props: DraggablePropertyCardProps) => {
  const { index, propertyId } = props;

  const property = useRecoilValue(formDialogPropertyAtom(propertyId));
  const valid = useRecoilValue(formDialogPropertyValidSelector(propertyId));

  const {
    changePropertyKind,
    changePropertyRequired,
    changePropertyName,
    changePropertyPayload,
    changePropertyArray,
    changePropertyExamples,
  } = useHandlers();

  const onChangePropertyKind = React.useCallback(
    (kind: SchemaPropertyKind, payload: FormDialogPropertyPayload) => {
      changePropertyKind({ id: propertyId, kind, payload });
    },
    [changePropertyKind, propertyId]
  );

  const onChangePropertyRequired = React.useCallback(
    (required: boolean) => {
      changePropertyRequired({ id: propertyId, required });
    },
    [changePropertyRequired, propertyId]
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

  const onChangeExamples = React.useCallback(
    (examples: readonly string[]) => {
      changePropertyExamples({ id: propertyId, examples });
    },
    [changePropertyExamples, propertyId]
  );

  return (
    <Draggable draggableId={propertyId} index={index}>
      {(provided, snapshot) => (
        <FormDialogPropertyCard
          draggable={{ provided, snapshot }}
          property={property}
          valid={valid}
          onChangeArray={onChangeArray}
          onChangeExamples={onChangeExamples}
          onChangeKind={onChangePropertyKind}
          onChangeName={onChangePropertyName}
          onChangePayload={onChangePayload}
          onChangeRequired={onChangePropertyRequired}
        />
      )}
    </Draggable>
  );
});
