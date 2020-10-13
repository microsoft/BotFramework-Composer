// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import * as React from 'react';
import {
  ArrayPropertyPayload,
  FormDialogPropertyPayload,
  FormDialogProperty,
  TypedPropertyPayload,
} from 'src/atoms/types';
import { Collapsible } from 'src/components/common/Collapsible';
import { ValuePicker } from 'src/components/common/ValuePicker';

const getDefaultCollapsed = (property: FormDialogProperty) => {
  const payload =
    property.kind === 'array'
      ? (property.payload as ArrayPropertyPayload).items
      : (property.payload as TypedPropertyPayload);
  return !(payload as TypedPropertyPayload).entities?.length && !property.examples?.length;
};

type Props = {
  /**
   * Property to show advanced options for.
   */
  property: FormDialogProperty;
  /**
   * Callback to update the property payload that includes advanced options.
   */
  onChangePayload: (payload: FormDialogPropertyPayload) => void;
  /**
   * Callback to update the examples for the property.
   */
  onChangeExamples: (examples: readonly string[]) => void;
};

export const AdvancedOptions = (props: Props) => {
  const { property, onChangePayload, onChangeExamples } = props;

  const defaultCollapsed = React.useMemo(() => getDefaultCollapsed(property), [property.id]);

  const payload =
    property.kind === 'array'
      ? (property.payload as ArrayPropertyPayload).items
      : (property.payload as TypedPropertyPayload);

  return (
    <Collapsible
      collapsed={defaultCollapsed}
      onRenderTitle={() => <Text styles={{ root: { fontStyle: 'italic' } }}>{formatMessage('Advanced options')}</Text>}
    >
      <Stack tokens={{ childrenGap: 16 }}>
        <ValuePicker
          label={formatMessage('Entities')}
          values={payload.entities || []}
          onChange={(entities) =>
            onChangePayload({
              ...payload,
              entities,
            } as FormDialogPropertyPayload)
          }
        />
        <ValuePicker
          label={formatMessage('Examples')}
          values={property.examples.slice() || []}
          onChange={onChangeExamples}
        />
      </Stack>
    </Collapsible>
  );
};
