// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from '@fluentui/react/lib/Stack';
import { CollapsibleSection } from '@uifabric/experiments/lib/CollapsibleSection';
import formatMessage from 'format-message';
import { observer } from 'mobx-react';
import * as React from 'react';
import { ValuePicker } from 'src/app/components/common/ValuePicker';
import { Context } from 'src/app/context/Context';
import { PropertyPayload, SchemaPropertyStore, TypedPropertyPayload } from 'src/app/stores/schemaPropertyStore';
import { getScopedTheme } from 'src/app/theme/stylist';

type Props = {
  /**
   * Property to show advanced options for.
   */
  property: SchemaPropertyStore;
  /**
   * Callback to update the property payload that includes advanced options.
   */
  onChangePayload: (payload: PropertyPayload) => void;
  /**
   * Callback to update the examples for the property.
   */
  onChangeExamples: (examples: readonly string[]) => void;
};

export const AdvancedOptions = observer((props: Props) => {
  const {
    settingsStore: { themeName },
  } = React.useContext(Context);

  const { property, onChangePayload, onChangeExamples } = props;

  const theme = React.useMemo(() => getScopedTheme('AdvancedOptions'), [themeName]);

  const defaultCollapsed = React.useRef(
    !(property.payload as TypedPropertyPayload).entities?.length && !property.examples?.length
  );

  return (
    <CollapsibleSection
      defaultCollapsed={defaultCollapsed.current}
      title={{
        text: formatMessage('Show advanced options'),
        styles: {
          root: {
            width: 'fit-content',
            cursor: 'pointer',
          },
          text: {
            fontSize: 14,
            fontWeight: 600,
            color: theme.color,
          },
          chevron: {
            color: theme.color,
          },
        },
      }}
    >
      <Stack tokens={{ childrenGap: 8 }}>
        <ValuePicker
          label={formatMessage('Entities')}
          values={(property.payload as TypedPropertyPayload).entities || []}
          onChange={(entities) =>
            onChangePayload({
              ...property.payload,
              entities,
            } as PropertyPayload)
          }
        />
        <ValuePicker
          label={formatMessage('Examples')}
          values={property.examples.slice() || []}
          onChange={onChangeExamples}
        />
      </Stack>
    </CollapsibleSection>
  );
});
