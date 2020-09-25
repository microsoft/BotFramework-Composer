// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useId } from '@uifabric/react-hooks';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import * as React from 'react';
import { FormDialogPropertyPayload, NumberPropertyPayload } from 'src/atoms/types';
import { FieldLabel } from 'src/components/common/FieldLabel';

type Props = {
  payload: NumberPropertyPayload;
  onChangePayload: (payload: FormDialogPropertyPayload) => void;
};

export const NumberPropertyContent = React.memo((props: Props) => {
  const { payload, onChangePayload } = props;

  const minTooltipId = useId('numberMin');
  const maxTooltipId = useId('numberMax');

  const onRenderLabel = React.useCallback(
    (helpText: string, tooltipId: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (props: any, defaultRender?: (props: any) => JSX.Element | null) => (
        <FieldLabel optional defaultRender={defaultRender(props)} helpText={helpText} tooltipId={tooltipId} />
      ),
    []
  );

  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <TextField
          aria-describedby={minTooltipId}
          label={formatMessage('Minimum')}
          placeholder={formatMessage('Enter a min value')}
          styles={{ root: { flex: 1 } }}
          type="number"
          value={`${payload.minimum || ''}`}
          onChange={(_e, value) =>
            onChangePayload({ ...payload, minimum: parseInt(value, 10) } as NumberPropertyPayload)
          }
          onRenderLabel={onRenderLabel(formatMessage('Minimum help text'), minTooltipId)}
        />
        <TextField
          aria-describedby={maxTooltipId}
          label={formatMessage('Maximum')}
          placeholder={formatMessage('Enter a max value')}
          styles={{ root: { flex: 1 } }}
          type="number"
          value={`${payload.maximum || ''}`}
          onChange={(_e, value) =>
            onChangePayload({ ...payload, maximum: parseInt(value, 10) } as NumberPropertyPayload)
          }
          onRenderLabel={onRenderLabel(formatMessage('Maximum help text'), maxTooltipId)}
        />
      </Stack>
    </Stack>
  );
});
