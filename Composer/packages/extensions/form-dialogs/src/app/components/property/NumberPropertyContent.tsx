// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from '@fluentui/react/lib/Stack';
import { TextField } from '@fluentui/react/lib/TextField';
import formatMessage from 'format-message';
import * as React from 'react';
import { NumberPropertyPayload, PropertyPayload } from 'src/app/stores/schemaPropertyStore';

type Props = { payload: NumberPropertyPayload; onChangePayload: (payload: PropertyPayload) => void };

export const NumberPropertyContent = React.memo((props: Props) => {
  const { payload, onChangePayload } = props;

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <TextField
          required
          label={formatMessage('Minimum')}
          placeholder={formatMessage('Enter a min value')}
          styles={{ root: { flex: 1 } }}
          type="number"
          value={`${payload.minimum || ''}`}
          onChange={(_e, value) =>
            onChangePayload({ ...payload, minimum: parseInt(value, 10) } as NumberPropertyPayload)
          }
        />
        <TextField
          required
          label={formatMessage('Maximum')}
          placeholder={formatMessage('Enter a max value')}
          styles={{ root: { flex: 1 } }}
          type="number"
          value={`${payload.maximum || ''}`}
          onChange={(_e, value) =>
            onChangePayload({ ...payload, maximum: parseInt(value, 10) } as NumberPropertyPayload)
          }
        />
      </Stack>
    </Stack>
  );
});
