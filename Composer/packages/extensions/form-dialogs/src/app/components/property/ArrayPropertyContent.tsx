// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, DropdownMenuItemType } from '@fluentui/react/lib/Dropdown';
import { Stack } from '@fluentui/react/lib/Stack';
import formatMessage from 'format-message';
import * as React from 'react';
import { NumberPropertyContent } from 'src/app/components/property/NumberPropertyContent';
import { RefPropertyContent } from 'src/app/components/property/RefPropertyContent';
import { StringPropertyContent } from 'src/app/components/property/StringPropertyContent';
import {
  ArrayPropertyPayload,
  NumberPropertyPayload,
  PropertyPayload,
  RefPropertyPayload,
  StringPropertyPayload,
} from 'src/app/stores/schemaPropertyStore';

const getItemKind = (kind: string) => (kind === 'number' ? 'number' : kind === 'string' ? 'string' : undefined);

/**
 * Renders property payload based on its type.
 * @param payload The property payload to render.
 * @param onChangePayload Callback to update the property payload.
 */
const renderPayload = (payload: ArrayPropertyPayload, onChangePayload: (payload: PropertyPayload) => void) => {
  const { items } = payload;

  const changePayload = (newPayload: PropertyPayload) => {
    onChangePayload({ kind: 'array', items: { ...newPayload } } as ArrayPropertyPayload);
  };

  switch (items.kind) {
    case 'number':
      return <NumberPropertyContent payload={items as NumberPropertyPayload} onChangePayload={changePayload} />;
    case 'string':
      return <StringPropertyContent payload={items as StringPropertyPayload} onChangePayload={changePayload} />;
    default:
      return <RefPropertyContent payload={items as RefPropertyPayload} onChangePayload={changePayload} />;
  }
};

type Props = {
  /**
   * Array property payload.
   */
  payload: ArrayPropertyPayload;
  /**
   * Callback yo update the property payload
   */
  onChangePayload: (payload: PropertyPayload) => void;
};

export const ArrayPropertyContent = React.memo((props: Props) => {
  const { payload, onChangePayload } = props;
  const selectedKey = payload.items.kind || 'ref';

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Dropdown
        label={formatMessage('Select array item type')}
        options={[
          { key: 'number', text: 'Number' },
          { key: 'string', text: 'String' },
          { key: 'divider', text: '', itemType: DropdownMenuItemType.Divider },
          { key: 'ref', text: 'Use Templates' },
        ]}
        selectedKey={selectedKey}
        onChange={(_e, option) =>
          onChangePayload({
            items: { kind: getItemKind(option.key as string) },
          } as ArrayPropertyPayload)
        }
      ></Dropdown>
      {renderPayload(payload, onChangePayload)}
    </Stack>
  );
});
